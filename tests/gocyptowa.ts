import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gocyptowa } from "../target/types/gocyptowa";
import { expect } from "chai";
import { Testuser1, Testuser2 } from "../test-users/test-users";

describe("gocyptowa", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gocyptowa as Program<Gocyptowa>;
  const wallet = provider.wallet as anchor.Wallet;
  console.log("Provider Wallet Public Key:", wallet.publicKey.toBase58());
  // Constants for seeds
  const SHARED_PDA_SEED = Buffer.from("shared_pda");
  const ROLLUP_PDA_SEED = Buffer.from("rollup_pda");

  // Derive the shared PDA address
  const [sharedPda, sharedPdaBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [SHARED_PDA_SEED],
    program.programId
  );

  // Test rollup IDs
  const rollupId1 = 1;
  const rollupId2 = 2;

  // Derive rollup PDA addresses
  const [rollupPda1] = anchor.web3.PublicKey.findProgramAddressSync(
    [ROLLUP_PDA_SEED, Buffer.from([rollupId1])],
    program.programId
  );

  const [rollupPda2] = anchor.web3.PublicKey.findProgramAddressSync(
    [ROLLUP_PDA_SEED, Buffer.from([rollupId2])],
    program.programId
  );

  // Test user keypairs
  const user1 = anchor.web3.Keypair.fromSecretKey(new Uint8Array(Testuser1));
  const user2 = anchor.web3.Keypair.fromSecretKey(new Uint8Array(Testuser2));
  console.log("User 1 Public Key:", user1.publicKey.toBase58());
  console.log("User 2 Public Key:", user2.publicKey.toBase58()); 

  // sleep function to wait for a specified time
  // This is useful for simulating delays in tests
  // or for waiting for transactions to be confirmed
  // before proceeding with the next test case.
  // It takes a number of milliseconds as an argument
  // and returns a Promise that resolves after the specified time.
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // it("Initializes the shared PDA", async () => {
  //   try {
  //     // Initialize the shared PDA
  //     await program.methods
  //       .initializeSharedPda()
  //       .accounts({
  //         sharedPda: sharedPda,
  //         signer: wallet.publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();

  //     // Wait for 3 seconds
  //     await sleep(3000);

  //     // Fetch the shared PDA account
  //     const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
  //     console.log("Shared PDA Account:", sharedPdaAccount);
      
  //     // Verify it was initialized correctly
  //     expect(sharedPdaAccount.events).to.be.an("array");
  //     expect(sharedPdaAccount.events.length).to.equal(0);
  //   } catch (error) {
  //     console.error("Error initializing shared PDA:", error);
  //     throw error;
  //   }
  // });


  it("Can send a message to rollup 1", async () => {
    try {
      // First initialize the rollup PDA using the correct initialize method
      try {
        console.log("Initializing rollup PDA...");
        await program.methods
          .initializeRollupPda(rollupId1)  // Use the new method with rollup ID parameter
          .accounts({
            rollupPda: rollupPda1,
            signer: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        // Wait for initialization to complete
        await sleep(1000);
        console.log("Rollup PDA initialized successfully");
      } catch (error) {
        // If initialization fails because account already exists, that's okay
        if (error.toString().includes("already in use")) {
          console.log("Rollup PDA already exists, continuing with test");
        } else {
          console.error("Error initializing rollup PDA:", error);
          throw error;
        }
      }
  
      // Then send the message
      const messageContent = "Hello from rollup test!";
      
      console.log("Sending message to rollup...");
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
  
      console.log("Message sent successfully");
      
      // Wait for message to be processed
      await sleep(1000);
  
      // Fetch and verify the rollup PDA account
      const rollupPdaAccount = await program.account.rollupPda.fetch(rollupPda1);
      console.log("Fetched rollup PDA account with", rollupPdaAccount.messages.length, "messages");
      
      // Verify the message was stored correctly
      expect(rollupPdaAccount.messages).to.be.an("array");
      expect(rollupPdaAccount.messages.length).to.be.at.least(1);
      
      // Find the message we just sent
      const sentMessage = rollupPdaAccount.messages.find(msg => 
        msg.content === messageContent && 
        msg.from.toString() === user1.publicKey.toString()
      );
      
      expect(sentMessage).to.not.be.undefined;
      expect(sentMessage.content).to.equal(messageContent);
      expect(sentMessage.from.toString()).to.equal(user1.publicKey.toString());
      
      console.log("Test completed successfully");
    } catch (error) {
      console.error("Error in test:", error);
      throw error;
    }
  });

  it("Can send multiple messages to different rollups", async () => {
    try {
      // Initialize rollup 1 if it doesn't exist
      try {
        console.log("Initializing rollup PDA 1...");
        await program.methods
          .initializeRollupPda(rollupId1)
          .accounts({
            rollupPda: rollupPda1,
            signer: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.log("Rollup PDA 1 initialized successfully");
      } catch (error) {
        if (error.toString().includes("already in use")) {
          console.log("Rollup PDA 1 already exists, continuing with test");
        } else {
          console.error("Error initializing rollup PDA 1:", error);
          throw error;
        }
      }
  
      // Initialize rollup 2 if it doesn't exist
      try {
        console.log("Initializing rollup PDA 2...");
        await program.methods
          .initializeRollupPda(rollupId2)
          .accounts({
            rollupPda: rollupPda2,
            signer: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.log("Rollup PDA 2 initialized successfully");
      } catch (error) {
        if (error.toString().includes("already in use")) {
          console.log("Rollup PDA 2 already exists, continuing with test");
        } else {
          console.error("Error initializing rollup PDA 2:", error);
          throw error;
        }
      }
  
      // Wait a bit for initialization to complete
      await sleep(1000);
  
      // Send message to rollup 1
      console.log("Sending message to rollup 1...");
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
      console.log("Sending message to rollup 2...");
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
  
      // Wait a bit for messages to be processed
      await sleep(1000);
  
      // Verify rollup 1 messages
      console.log("Verifying rollup 1 messages...");
      const rollupPda1Account = await program.account.rollupPda.fetch(rollupPda1);
      expect(rollupPda1Account.messages).to.be.an("array");
      expect(rollupPda1Account.messages.length).to.be.at.least(1);
      
      // Find the message we just sent
      const user2Message = rollupPda1Account.messages.find(msg => 
        msg.content === "Message to rollup 1 from user 2" && 
        msg.from.toString() === user2.publicKey.toString()
      );
      expect(user2Message).to.not.be.undefined;
      expect(user2Message.from.toString()).to.equal(user2.publicKey.toString());
      expect(user2Message.content).to.equal("Message to rollup 1 from user 2");
  
      // Verify rollup 2 messages
      console.log("Verifying rollup 2 messages...");
      const rollupPda2Account = await program.account.rollupPda.fetch(rollupPda2);
      expect(rollupPda2Account.messages).to.be.an("array");
      expect(rollupPda2Account.messages.length).to.be.at.least(1);
      
      // Find the message we just sent
      const user1Message = rollupPda2Account.messages.find(msg => 
        msg.content === "Message to rollup 2 from user 1" && 
        msg.from.toString() === user1.publicKey.toString()
      );
      expect(user1Message).to.not.be.undefined;
      expect(user1Message.from.toString()).to.equal(user1.publicKey.toString());
      expect(user1Message.content).to.equal("Message to rollup 2 from user 1");
      
      console.log("Test completed successfully");
    } catch (error) {
      console.error("Error sending multiple messages:", error);
      throw error;
    }
  });
  
  it("Can broadcast events to the shared PDA", async () => {
    try {
      // Initialize shared PDA if it doesn't exist
      try {
        console.log("Initializing shared PDA...");
        await program.methods
          .initializeSharedPda()
          .accounts({
            sharedPda: sharedPda,
            signer: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.log("Shared PDA initialized successfully");
      } catch (error) {
        if (error.toString().includes("already in use")) {
          console.log("Shared PDA already exists, continuing with test");
        } else {
          console.error("Error initializing shared PDA:", error);
          throw error;
        }
      }
  
      // Wait a bit for initialization to complete
      await sleep(1000);
  
      // Broadcast an event
      const topic = "new_block";
      const eventData = { 
        height: 1000, 
        hash: "0xabc123", 
        timestamp: new Date().toISOString() 
      };
      const serializedData = Buffer.from(JSON.stringify(eventData));
      
      console.log("Broadcasting event...");
      await program.methods
        .broadcastEvent(
          topic, 
          serializedData
        )
        .accounts({
          sharedPda: sharedPda,
          signer: wallet.publicKey,
        })
        .rpc();
  
      // Wait a bit for event to be processed
      await sleep(1000);
  
      // Verify the event was stored correctly
      console.log("Verifying event was stored...");
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      expect(sharedPdaAccount.events).to.be.an("array");
      expect(sharedPdaAccount.events.length).to.be.at.least(1);
      
      // Find the event we just sent
      const newBlockEvent = sharedPdaAccount.events.find(event => 
        event.topic === topic
      );
      expect(newBlockEvent).to.not.be.undefined;
      expect(newBlockEvent.topic).to.equal(topic);
      
      // Decode and verify payload
      const payloadData = Buffer.from(newBlockEvent.payload.data);
      const decodedData = JSON.parse(payloadData.toString());
      expect(decodedData.height).to.equal(eventData.height);
      expect(decodedData.hash).to.equal(eventData.hash);
      
      console.log("Test completed successfully");
    } catch (error) {
      console.error("Error broadcasting event:", error);
      throw error;
    }
  });
  
  it("Can broadcast multiple events with different topics", async () => {
    try {
      // Initialize shared PDA if it doesn't exist
      try {
        console.log("Initializing shared PDA...");
        await program.methods
          .initializeSharedPda()
          .accounts({
            sharedPda: sharedPda,
            signer: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.log("Shared PDA initialized successfully");
      } catch (error) {
        if (error.toString().includes("already in use")) {
          console.log("Shared PDA already exists, continuing with test");
        } else {
          console.error("Error initializing shared PDA:", error);
          throw error;
        }
      }
  
      // Wait a bit for initialization to complete
      await sleep(1000);
  
      // Broadcast transaction event
      const txTopic = "transaction";
      const txData = { 
        txId: "0x123456", 
        sender: user1.publicKey.toString(), 
        receiver: user2.publicKey.toString(),
        amount: 100,
      };
      
      console.log("Broadcasting transaction event...");
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
      
      console.log("Broadcasting state update event...");
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
  
      // Wait a bit for events to be processed
      await sleep(1000);
  
      // Verify events were stored correctly
      console.log("Verifying events were stored...");
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      expect(sharedPdaAccount.events).to.be.an("array");
      
      // Find the transaction event
      const txEvent = sharedPdaAccount.events.find(event => 
        event.topic === txTopic
      );
      expect(txEvent).to.not.be.undefined;
      expect(txEvent.topic).to.equal(txTopic);
      const txPayload = JSON.parse(Buffer.from(txEvent.payload.data).toString());
      expect(txPayload.txId).to.equal(txData.txId);
      expect(txPayload.amount).to.equal(txData.amount);
      
      // Find the state update event
      const stateEvent = sharedPdaAccount.events.find(event => 
        event.topic === stateTopic
      );
      expect(stateEvent).to.not.be.undefined;
      expect(stateEvent.topic).to.equal(stateTopic);
      const statePayload = JSON.parse(Buffer.from(stateEvent.payload.data).toString());
      expect(statePayload.rollupId).to.equal(stateData.rollupId);
      expect(statePayload.stateRoot).to.equal(stateData.stateRoot);
      
      console.log("Test completed successfully");
    } catch (error) {
      console.error("Error broadcasting multiple events:", error);
      throw error;
    }
  });
  
  it("Demonstrates filtering events by topic", async () => {
    try {
      // Initialize shared PDA if it doesn't exist
      try {
        console.log("Initializing shared PDA...");
        await program.methods
          .initializeSharedPda()
          .accounts({
            sharedPda: sharedPda,
            signer: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.log("Shared PDA initialized successfully");
      } catch (error) {
        if (error.toString().includes("already in use")) {
          console.log("Shared PDA already exists, continuing with test");
        } else {
          console.error("Error initializing shared PDA:", error);
          throw error;
        }
      }
  
      // Wait a bit for initialization to complete
      await sleep(1000);
  
      // Fetch the shared PDA account
      console.log("Fetching shared PDA account...");
      const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
      
      // Filter events by topic
      const txEvents = sharedPdaAccount.events.filter(event => event.topic === "transaction");
      const stateEvents = sharedPdaAccount.events.filter(event => event.topic === "state_update");
      const blockEvents = sharedPdaAccount.events.filter(event => event.topic === "new_block");
      
      console.log(`Found ${txEvents.length} transaction events`);
      console.log(`Found ${stateEvents.length} state update events`);
      console.log(`Found ${blockEvents.length} block events`);
      
      // Process transaction events
      for (const event of txEvents) {
        const data = JSON.parse(Buffer.from(event.payload.data).toString());
        console.log("Transaction event data:", data);
        // implementation -- handle transaction data
      }
      
      console.log("Test completed successfully");
    } catch (error) {
      console.error("Error filtering events:", error);
      throw error;
    }
  });
  
  // it("Simulates a cross-rollup communication scenario", async () => {
  //   try {
  //     // Initialize shared PDA if it doesn't exist
  //     try {
  //       console.log("Initializing shared PDA...");
  //       await program.methods
  //         .initializeSharedPda()
  //         .accounts({
  //           sharedPda: sharedPda,
  //           signer: wallet.publicKey,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //         })
  //         .rpc();
  //       console.log("Shared PDA initialized successfully");
  //     } catch (error) {
  //       if (error.toString().includes("already in use")) {
  //         console.log("Shared PDA already exists, continuing with test");
  //       } else {
  //         console.error("Error initializing shared PDA:", error);
  //         throw error;
  //       }
  //     }
  
  //     // Initialize rollup 1 if it doesn't exist
  //     try {
  //       console.log("Initializing rollup PDA 1...");
  //       await program.methods
  //         .initializeRollupPda(rollupId1)
  //         .accounts({
  //           rollupPda: rollupPda1,
  //           signer: wallet.publicKey,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //         })
  //         .rpc();
  //       console.log("Rollup PDA 1 initialized successfully");
  //     } catch (error) {
  //       if (error.toString().includes("already in use")) {
  //         console.log("Rollup PDA 1 already exists, continuing with test");
  //       } else {
  //         console.error("Error initializing rollup PDA 1:", error);
  //         throw error;
  //       }
  //     }
  
  //     // Initialize rollup 2 if it doesn't exist
  //     try {
  //       console.log("Initializing rollup PDA 2...");
  //       await program.methods
  //         .initializeRollupPda(rollupId2)
  //         .accounts({
  //           rollupPda: rollupPda2,
  //           signer: wallet.publicKey,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //         })
  //         .rpc();
  //       console.log("Rollup PDA 2 initialized successfully");
  //     } catch (error) {
  //       if (error.toString().includes("already in use")) {
  //         console.log("Rollup PDA 2 already exists, continuing with test");
  //       } else {
  //         console.error("Error initializing rollup PDA 2:", error);
  //         throw error;
  //       }
  //     }
  
  //     // Wait a bit for initialization to complete
  //     await sleep(1000);
  
  //     // Scenario: Rollup 1 submits proof of finality to rollup 2
      
  //     // Step 1: Rollup 1 broadcasts a finality proof
  //     const finalityTopic = "finality_proof";
  //     const finalityData = {
  //       sourceRollupId: rollupId1,
  //       targetRollupId: rollupId2,
  //       blockHeight: 5000,
  //       stateRoot: "0x7890abcdef",
  //       proof: "0x01234567890abcdef",
  //       timestamp: Date.now()
  //     };
      
  //     console.log("Broadcasting finality proof...");
  //     await program.methods
  //       .broadcastEvent(
  //         finalityTopic, 
  //         Array.from(Buffer.from(JSON.stringify(finalityData)))
  //       )
  //       .accounts({
  //         sharedPda: sharedPda,
  //         signer: wallet.publicKey,
  //       })
  //       .rpc();
      
  //     // Step 2: Rollup 2 sends a message acknowledging receipt
  //     console.log("Sending acknowledgment message...");
  //     await program.methods
  //       .sendMessage(
  //         rollupId1, // sending to rollup 1
  //         {
  //           from: user2.publicKey, // from a user on rollup 2
  //           content: JSON.stringify({
  //             type: "finality_ack",
  //             sourceRollupId: rollupId2,
  //             targetRollupId: rollupId1,
  //             originalProofHeight: finalityData.blockHeight,
  //             status: "verified"
  //           })
  //         }
  //       )
  //       .accounts({
  //         rollupPda: rollupPda1,
  //         signer: wallet.publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();
      
  //     // Wait a bit for messages to be processed
  //     await sleep(1000);
      
  //     // Verify the flow worked correctly
  //     console.log("Verifying cross-rollup communication...");
      
  //     // 1. Check that the finality proof was broadcast
  //     const sharedPdaAccount = await program.account.sharedPda.fetch(sharedPda);
  //     const finalityEvents = sharedPdaAccount.events.filter(e => e.topic === finalityTopic);
  //     expect(finalityEvents.length).to.be.at.least(1);
      
  //     // Find the finality event we just sent
  //     const finalityEvent = finalityEvents.find(event => {
  //       const data = JSON.parse(Buffer.from(event.payload.data).toString());
  //       return data.blockHeight === finalityData.blockHeight && 
  //              data.stateRoot === finalityData.stateRoot;
  //     });
  //     expect(finalityEvent).to.not.be.undefined;
      
  //     // 2. Check that the acknowledgement message was sent
  //     const rollupPda1Account = await program.account.rollupPda.fetch(rollupPda1);
      
  //     // Find the acknowledgment message we just sent
  //     const ackMessage = rollupPda1Account.messages.find(msg => {
  //       try {
  //         const data = JSON.parse(msg.content);
  //         return data.type === "finality_ack" && 
  //                data.originalProofHeight === finalityData.blockHeight &&
  //                data.status === "verified";
  //       } catch (e) {
  //         return false;
  //       }
  //     });
      
  //     expect(ackMessage).to.not.be.undefined;
  //     const ackData = JSON.parse(ackMessage.content);
  //     expect(ackData.type).to.equal("finality_ack");
  //     expect(ackData.originalProofHeight).to.equal(finalityData.blockHeight);
  //     expect(ackData.status).to.equal("verified");
      
  //     console.log("Test completed successfully");
  //   } catch (error) {
  //     console.error("Error in cross-rollup scenario:", error);
  //     throw error;
  //   }
  // });


});