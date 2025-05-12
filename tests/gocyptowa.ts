import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { CrossRollupComm } from "../target/types/cross_rollup_comm";
import { expect } from "chai";
describe("Cross Rollup Communication Tests", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CrossRollupComm as Program<CrossRollupComm>;
  // const devNetUrl = "https://api.devnet.solana.com";
  // PDAs
  let sharedPda: anchor.web3.PublicKey;
  let sharedPdaBump: number;
  let registryPda: anchor.web3.PublicKey;
  let registryPdaBump: number;
  let sonicSvmPda: anchor.web3.PublicKey;
  let sonicSvmPdaBump: number;
  let soonSvmPda: anchor.web3.PublicKey;
  let soonSvmPdaBump: number;
  let priceFeedPda: anchor.web3.PublicKey;
  let priceFeedBump: number;

  // Constants
  const sonicSvmId = 1;
  const soonSvmId = 2;
  const sonicSvmName = "SonicSvm";
  const soonSvmName = "SoonSvm";
  const sonicSvmMetadata = "Fastest Layer 2 rollup solution";
  const soonSvmMetadata = "Optimistic rollup for Solana";
  const btcUsdPair = "BTC/USD";

  const SHARED_PDA_SEED = "shared_pda";
  const ROLLUP_PDA_SEED = "rollup_pda";
  const REGISTRY_PDA_SEED = "registry_pda";
  const PRICE_FEED_SEED = "price_feed";

  before(async () => {
    // Find PDA addresses
    [sharedPda, sharedPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(SHARED_PDA_SEED)],
      program.programId
    );

    [registryPda, registryPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(REGISTRY_PDA_SEED)],
      program.programId
    );

    [sonicSvmPda, sonicSvmPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([sonicSvmId])],
      program.programId
    );

    [soonSvmPda, soonSvmPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([soonSvmId])],
      program.programId
    );

    [priceFeedPda, priceFeedBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(PRICE_FEED_SEED), Buffer.from(btcUsdPair)],
      program.programId
    );
  });

  it("Initializes the shared PDA", async () => {
    try {
      // Initialize the shared PDA
      const tx = await program.methods
        .initializeSharedPda()
        .accounts({
          sharedPda: sharedPda,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log("Transaction signature:", tx);
      
      // Verify the shared PDA was initialized correctly
      const sharedAccount = await program.account.sharedPda.fetch(sharedPda);
      expect(sharedAccount.events).to.be.an('array');
      expect(sharedAccount.events.length).to.equal(0);
      expect(sharedAccount.lastSequence.toNumber()).to.equal(0);
      expect(sharedAccount.bump).to.equal(sharedPdaBump);
      
    } catch (e) {
      console.error("Failed to initialize shared PDA:", e);
      throw e;
    }
  });

  it("Initializes the registry", async () => {
    try {
      await program.methods
        .initializeRegistry()
        .accounts({
          registry: registryPda,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const registryAccount = await program.account.rollupRegistry.fetch(registryPda);
      expect(registryAccount.rollups).to.be.empty;
      expect(registryAccount.bump).to.equal(registryPdaBump);
    } catch (e) {
      console.error("Failed to initialize registry:", e);
      throw e;
    }
  });

  it("Initializes a price feed", async () => {
    try {
      await program.methods
        .initializePriceFeed(btcUsdPair)
        .accounts({
          priceFeed: priceFeedPda,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const priceFeedAccount = await program.account.priceFeed.fetch(priceFeedPda);
      expect(priceFeedAccount.pair).to.equal(btcUsdPair);
      expect(priceFeedAccount.prices).to.be.empty;
      expect(priceFeedAccount.bump).to.equal(priceFeedBump);
    } catch (e) {
      console.error("Failed to initialize price feed:", e);
      throw e;
    }
  });

  it("Registers SonicSvm rollup", async () => {
    try {
      await program.methods
        .registerRollup(sonicSvmId, sonicSvmName, sonicSvmMetadata)
        .accounts({
          rollupPda: sonicSvmPda,
          registry: registryPda,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await sleep(3000); // Wait for 3 seconds to ensure the transaction is confirmed

      const rollupAccount = await program.account.rollupPda.fetch(sonicSvmPda);
      expect(rollupAccount.rollupId).to.equal(sonicSvmId);
      expect(rollupAccount.name).to.equal(sonicSvmName);
      expect(rollupAccount.owner.toString()).to.equal(provider.wallet.publicKey.toString());
    } catch (e) {
      console.error("Failed to register SonicSvm:", e);
      throw e;
    }
  });

  it("Updates SonicSvm metadata", async () => {
    try {
      const updatedMetadata = "The super network for Solana";
      await program.methods
        .updateRollupMetadata(updatedMetadata)
        .accounts({
          registry: registryPda,
          rollupPda: sonicSvmPda,
          owner: provider.wallet.publicKey,
        })
        .rpc();

      await sleep(3000); // Wait for 3 seconds to ensure the transaction is confirmed

      const registryAccount = await program.account.rollupRegistry.fetch(registryPda);
      // console.log("Registry Account:", registryAccount);
      const rollupInfo = registryAccount.rollups.find(r => r.id === sonicSvmId);
        
      expect(rollupInfo.metadata).to.equal(updatedMetadata);
      console.log("SonicSvm metadata updated successfully:", rollupInfo.metadata);
    } catch (e) {
      console.error("Failed to update SonicSvm metadata:", e);
      throw e;
    }
  });

  it("Registers SoonSvm rollup", async () => {
    try {
      await program.methods
        .registerRollup(soonSvmId, soonSvmName, soonSvmMetadata)
        .accounts({
          rollupPda: soonSvmPda,
          registry: registryPda,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await sleep(2000); // Wait for 2 seconds to ensure the transaction is confirmed

      const rollupAccount = await program.account.rollupPda.fetch(soonSvmPda);
      expect(rollupAccount.rollupId).to.equal(soonSvmId);
      expect(rollupAccount.name).to.equal(soonSvmName);
      expect(rollupAccount.owner.toString()).to.equal(provider.wallet.publicKey.toString());
    } catch (e) {
      console.error("Failed to register SonicSvm:", e);
      throw e;
    }
  });

  it("Sends a message from SonicSvm to SoonSvm", async () => {
    const content = Buffer.from("Hello from SonicSvm!");
    const messageType = { crossRollupMessage: {} }; // Match your MessageType enum
    // const message = {
    //   content,
    //   messageType,
    //   sequence: new BN(1),
    //   timestamp: new BN(Date.now()),
    // };
    try {
      await program.methods
        .sendMessage(sonicSvmId, content, messageType)
        .accounts({
          targetRollupPda: soonSvmPda,
          sourceRollupPda: sonicSvmPda,
          sender: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const targetRollup = await program.account.rollupPda.fetch(soonSvmPda);
      expect(targetRollup.messages).to.have.length.above(0);
      expect(targetRollup.messages[0].content).to.deep.equal(content);
    } catch (e) {
      console.error("Failed to send message:", e);
      throw e;
    }
  });

  it("Broadcasts an event from SonicSvm", async () => {
    const topic = "price_update";
    const payload = Buffer.from("BTC price updated");
    try {
      await program.methods
        .broadcastEvent(sonicSvmId, topic, payload)
        .accounts({
          sharedPda: sharedPda,
          sourceRollup: sonicSvmPda,
          broadcaster: provider.wallet.publicKey,
        })
        .rpc();

      const sharedAccount = await program.account.sharedPda.fetch(sharedPda);
      expect(sharedAccount.events).to.have.length.above(0);
      expect(sharedAccount.events[0].topic).to.equal(topic);
    } catch (e) {
      console.error("Failed to broadcast event:", e);
      throw e;
    }
  });

  it("Retrieves broadcasted messages and logs", async () => {
    try {
        // Fetch and verify the shared PDA contents
        const sharedAccount = await program.account.sharedPda.fetch(sharedPda);
        console.log("Shared Account:", sharedAccount);

        // Verify account structure
        expect(sharedAccount.events).to.have.length(2);
        expect(sharedAccount.lastSequence.toNumber()).to.equal(2);
        expect(sharedAccount.bump).to.equal(255);

        // Format and log events in a readable way
        const formattedEvents = sharedAccount.events.map(event => ({
            from: event.from.toString(),
            topic: event.topic,
            timestamp: new Date(event.timestamp.toNumber() * 1000).toISOString(),
            payload: Buffer.from(event.payload).toString('utf-8'),
            sequence: event.sequence.toNumber()
        }));

        console.log("Broadcasted Events:");
        formattedEvents.forEach(event => {
            console.log(`\nEvent #${event.sequence}:`);
            console.log(`- From: ${event.from}`);
            console.log(`- Topic: ${event.topic}`);
            console.log(`- Time: ${event.timestamp}`);
            console.log(`- Payload: ${event.payload}`);
        });

      } catch (e) {
          console.error("Failed to retrieve broadcasted messages:", e);
          throw e;
      }
  });

  it("Updates BTC/USD price from SonicSvm", async () => {
    const price = new BN(50000);
    const timestamp = new BN(Date.now());
    try {
      await program.methods
        .updatePrice(sonicSvmId, btcUsdPair, price, timestamp)
        .accounts({
          priceFeed: priceFeedPda,
          sourceRollup: sonicSvmPda,
          updater: provider.wallet.publicKey,
        })
        .rpc();

      const priceFeedAccount = await program.account.priceFeed.fetch(priceFeedPda);
      expect(priceFeedAccount.prices).to.have.length.above(0);
      expect(priceFeedAccount.prices[0].price.toString()).to.equal(price.toString());
    } catch (e) {
      console.error("Failed to update price:", e);
      throw e;
    }
  });

  it("Deactivates SoonSvm rollup", async () => {
    try {
      await program.methods
        .updateRollupStatus(false)
        .accounts({
          registry: registryPda,
          rollupPda: soonSvmPda,
          owner: provider.wallet.publicKey,
        })
        .rpc();

      const registryAccount = await program.account.rollupRegistry.fetch(registryPda);
      const rollupInfo = registryAccount.rollups.find(r => r.rollupId === soonSvmId);
      expect(rollupInfo.isActive).to.be.false;
    } catch (e) {
      console.error("Failed to deactivate SoonSvm:", e);
      throw e;
    }
  });

  it("Reactivates SoonSvm rollup", async () => {
    try {
      await program.methods
        .updateRollupStatus(true)
        .accounts({
          registry: registryPda,
          rollupPda: soonSvmPda,
          owner: provider.wallet.publicKey,
        })
        .rpc();

      const registryAccount = await program.account.rollupRegistry.fetch(registryPda);
      const rollupInfo = registryAccount.rollups.find(r => r.rollupId === soonSvmId);
      expect(rollupInfo.isActive).to.be.true;
    } catch (e) {
      console.error("Failed to reactivate SoonSvm:", e);
      throw e;
    }
  });

});

async function sleep(arg0: number) {
  return new Promise((resolve) => setTimeout(resolve, arg0));
}
