import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gocyptowa } from "../target/types/gocyptowa";
import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";

describe("gocyptowa", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gocyptowa as Program<Gocyptowa>;
  const wallet = provider.wallet as anchor.Wallet;

  // Constants for seeds
  const SHARED_PDA_SEED = Buffer.from("shared_pda");
  const ROLLUP_PDA_SEED = Buffer.from("rollup_pda");

  // Derive the shared PDA address
  const [sharedPda, sharedPdaBump] = PublicKey.findProgramAddressSync(
    [SHARED_PDA_SEED],
    program.programId
  );

  // Test rollup IDs
  const rollupId1 = 1;
  const rollupId2 = 2;

  // Derive rollup PDA addresses
  const [rollupPda1] = PublicKey.findProgramAddressSync(
    [ROLLUP_PDA_SEED, Buffer.from([rollupId1])],
    program.programId
  );

  const [rollupPda2] = PublicKey.findProgramAddressSync(
    [ROLLUP_PDA_SEED, Buffer.from([rollupId2])],
    program.programId
  );

  // Test user keypairs
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();
  console.log("User 1 Public Key:", user1);
  console.log("User 2 Public Key:", user2);  

  before(async () => {
    // Airdrop SOL to test users
    const airdropSignature1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature1);

    const airdropSignature2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature2);
  });

  it("Initializes the shared PDA", async () => {
    try {
      // Initialize the shared PDA
      await program.methods
        .initializeSharedPda()
        .accounts({
          sharedPda: sharedPda,
          signer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch the shared PDA account
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      
      // Verify it was initialized correctly
      expect(sharedPdaAccount.events).to.be.an("array");
      expect(sharedPdaAccount.events.length).to.equal(0);
    } catch (error) {
      console.error("Error initializing shared PDA:", error);
      throw error;
    }
  });

  it("Can send a message to rollup 1", async () => {
    try {
      // Create a message from user1 to rollup 1
      const messageContent = "Hello from rollup test!";
      
      await program.methods
        .sendMessage(
          rollupId1,
          {
            from: user1.publicKey,
            content: messageContent,
          }
        )
        .accounts({
          rollupPda: rollupPda1,
          signer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch the rollup PDA account
      const rollupPdaAccount = await program.account.rollupPda.fetch(rollupPda1);
      
      // Verify the message was stored correctly
      expect(rollupPdaAccount.messages).to.be.an("array");
      expect(rollupPdaAccount.messages.length).to.equal(1);
      expect(rollupPdaAccount.messages[0].content).to.equal(messageContent);
      expect(rollupPdaAccount.messages[0].from.toString()).to.equal(user1.publicKey.toString());
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  });

  it("Can send multiple messages to different rollups", async () => {
    try {
      // Send message to rollup 1
      await program.methods
        .sendMessage(
          rollupId1,
          {
            from: user2.publicKey,
            content: "Message to rollup 1 from user 2",
          }
        )
        .accounts({
          rollupPda: rollupPda1,
          signer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Send message to rollup 2
      await program.methods
        .sendMessage(
          rollupId2,
          {
            from: user1.publicKey,
            content: "Message to rollup 2 from user 1",
          }
        )
        .accounts({
          rollupPda: rollupPda2,
          signer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Verify rollup 1 messages
      const rollupPda1Account = await program.account.rollupPda.fetch(rollupPda1);
      expect(rollupPda1Account.messages.length).to.equal(2);
      expect(rollupPda1Account.messages[1].from.toString()).to.equal(user2.publicKey.toString());
      expect(rollupPda1Account.messages[1].content).to.equal("Message to rollup 1 from user 2");

      // Verify rollup 2 messages
      const rollupPda2Account = await program.account.rollupPda.fetch(rollupPda2);
      expect(rollupPda2Account.messages.length).to.equal(1);
      expect(rollupPda2Account.messages[0].from.toString()).to.equal(user1.publicKey.toString());
      expect(rollupPda2Account.messages[0].content).to.equal("Message to rollup 2 from user 1");
    } catch (error) {
      console.error("Error sending multiple messages:", error);
      throw error;
    }
  });

  it("Can broadcast events to the shared PDA", async () => {
    try {
      // Broadcast an event
      const topic = "new_block";
      const eventData = { 
        height: 1000, 
        hash: "0xabc123", 
        timestamp: new Date().toISOString() 
      };
      const serializedData = Buffer.from(JSON.stringify(eventData));
      
      await program.methods
        .broadcastEvent(
          topic, 
          Array.from(serializedData)
        )
        .accounts({
          sharedPda: sharedPda,
          signer: wallet.publicKey,
        })
        .rpc();

      // Verify the event was stored correctly
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      expect(sharedPdaAccount.events.length).to.equal(1);
      expect(sharedPdaAccount.events[0].topic).to.equal(topic);
      
      // Decode and verify payload
      const payloadData = Buffer.from(sharedPdaAccount.events[0].payload.data);
      const decodedData = JSON.parse(payloadData.toString());
      expect(decodedData.height).to.equal(eventData.height);
      expect(decodedData.hash).to.equal(eventData.hash);
    } catch (error) {
      console.error("Error broadcasting event:", error);
      throw error;
    }
  });

  it("Can broadcast multiple events with different topics", async () => {
    try {
      // Broadcast transaction event
      const txTopic = "transaction";
      const txData = { 
        txId: "0x123456", 
        sender: user1.publicKey.toString(), 
        receiver: user2.publicKey.toString(),
        amount: 100,
      };
      
      await program.methods
        .broadcastEvent(
          txTopic, 
          Array.from(Buffer.from(JSON.stringify(txData)))
        )
        .accounts({
          sharedPda: sharedPda,
          signer: wallet.publicKey,
        })
        .rpc();

      // Broadcast state update event
      const stateTopic = "state_update";
      const stateData = { 
        rollupId: rollupId1, 
        newState: "0xabcdef123456", 
        stateRoot: "0xfedcba654321"
      };
      
      await program.methods
        .broadcastEvent(
          stateTopic, 
          Array.from(Buffer.from(JSON.stringify(stateData)))
        )
        .accounts({
          sharedPda: sharedPda,
          signer: wallet.publicKey,
        })
        .rpc();

      // Verify events were stored correctly
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      expect(sharedPdaAccount.events.length).to.equal(3); // Including previous test's event
      
      // Check second event (transaction)
      const txEvent = sharedPdaAccount.events[1];
      expect(txEvent.topic).to.equal(txTopic);
      const txPayload = JSON.parse(Buffer.from(txEvent.payload.data).toString());
      expect(txPayload.txId).to.equal(txData.txId);
      expect(txPayload.amount).to.equal(txData.amount);
      
      // Check third event (state update)
      const stateEvent = sharedPdaAccount.events[2];
      expect(stateEvent.topic).to.equal(stateTopic);
      const statePayload = JSON.parse(Buffer.from(stateEvent.payload.data).toString());
      expect(statePayload.rollupId).to.equal(stateData.rollupId);
      expect(statePayload.stateRoot).to.equal(stateData.stateRoot);
    } catch (error) {
      console.error("Error broadcasting multiple events:", error);
      throw error;
    }
  });

  it("Demonstrates filtering events by topic", async () => {
    // Fetch the shared PDA account
    const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
    
    // Filter events by topic
    const txEvents = sharedPdaAccount.events.filter(event => event.topic === "transaction");
    const stateEvents = sharedPdaAccount.events.filter(event => event.topic === "state_update");
    const blockEvents = sharedPdaAccount.events.filter(event => event.topic === "new_block");
    
    // Verify filtering works
    expect(txEvents.length).to.equal(1);
    expect(stateEvents.length).to.equal(1);
    expect(blockEvents.length).to.equal(1);
    
    // Process a transaction event example
    for (const event of txEvents) {
      const data = JSON.parse(Buffer.from(event.payload.data).toString());
      expect(data.txId).to.equal("0x123456");
      // In a real implementation, you'd handle this transaction data
    }
  });

  it("Simulates a cross-rollup communication scenario", async () => {
    try {
      // Scenario: Rollup 1 submits proof of finality to rollup 2
      
      // Step 1: Rollup 1 broadcasts a finality proof
      const finalityTopic = "finality_proof";
      const finalityData = {
        sourceRollupId: rollupId1,
        targetRollupId: rollupId2,
        blockHeight: 5000,
        stateRoot: "0x7890abcdef",
        proof: "0x01234567890abcdef",
        timestamp: Date.now()
      };
      
      await program.methods
        .broadcastEvent(
          finalityTopic, 
          Array.from(Buffer.from(JSON.stringify(finalityData)))
        )
        .accounts({
          sharedPda: sharedPda,
          signer: wallet.publicKey,
        })
        .rpc();
      
      // Step 2: Rollup 2 sends a message acknowledging receipt
      await program.methods
        .sendMessage(
          rollupId1, // sending to rollup 1
          {
            from: user2.publicKey, // from a user on rollup 2
            content: JSON.stringify({
              type: "finality_ack",
              sourceRollupId: rollupId2,
              targetRollupId: rollupId1,
              originalProofHeight: finalityData.blockHeight,
              status: "verified"
            })
          }
        )
        .accounts({
          rollupPda: rollupPda1,
          signer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      // Verify the flow worked correctly
      // 1. Check that the finality proof was broadcast
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      const finalityEvents = sharedPdaAccount.events.filter(e => e.topic === finalityTopic);
      expect(finalityEvents.length).to.equal(1);
      
      // 2. Check that the acknowledgement message was sent
      const rollupPda1Account = await program.account.rollupPda.fetch(rollupPda1);
      const lastMessage = rollupPda1Account.messages[rollupPda1Account.messages.length - 1];
      const ackData = JSON.parse(lastMessage.content);
      
      expect(ackData.type).to.equal("finality_ack");
      expect(ackData.originalProofHeight).to.equal(finalityData.blockHeight);
      expect(ackData.status).to.equal("verified");
    } catch (error) {
      console.error("Error in cross-rollup scenario:", error);
      throw error;
    }
  });
});