import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gocyptowa } from "../target/types/gocyptowa";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("gocyptowa - Rollup Messaging Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gocyptowa as Program<Gocyptowa>;

  // === Constants ===
  const SHARED_PDA_SEED = "shared";
  const ROLLUP_PDA_SEED = "rollup";

  // === Keypairs ===
  const rollupA = anchor.web3.Keypair.generate();

  let sharedPda: PublicKey;
  let rollupPdaA: PublicKey;
  let bumpShared: number;
  let bumpRollup: number;

  before(async () => {
    // Airdrop to rollupA
    const tx = await provider.connection.requestAirdrop(
      rollupA.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(tx);

    // Derive Shared PDA
    [sharedPda, bumpShared] = await PublicKey.findProgramAddressSync(
      [Buffer.from(SHARED_PDA_SEED)],
      program.programId
    );

    // Derive Rollup PDA for A
    [rollupPdaA, bumpRollup] = await PublicKey.findProgramAddressSync(
      [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([1])], // rollup_id = 1
      program.programId
    );
  });

  it("Broadcasts an event to Shared PDA", async () => {
    const event = {
      eventType: 1, // discovery
      emittingRollupId: 1,
      targetRollupId: null,
      data: Buffer.from("RollupA registered").toJSON().data,
      timestamp: new anchor.BN(Date.now()),
    };

    await program.methods
      .broadcastEvent(event)
      .accounts({
        sharedPda,
        signer: rollupA.publicKey,
      })
      .signers([rollupA])
      .rpc();

    console.log("✅ Broadcasted event from RollupA");
  });

  it("Sends a direct message to Rollup PDA", async () => {
    const msg = {
      senderRollupId: 1,
      payloadType: 1, // e.g., asset transfer
      payload: Buffer.from("Hello from RollupA").toJSON().data,
      timestamp: new anchor.BN(Date.now()),
    };

    await program.methods
      .sendMessage(msg)
      .accounts({
        rollupPda: rollupPdaA,
        signer: rollupA.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([rollupA])
      .rpc();

    console.log("📬 Sent message to Rollup-A inbox");
  });

  it("Fetches and parses data from Rollup PDA", async () => {
    const rollupPdaState = await program.account.rollupPda.fetch(rollupPdaA);
    const messages = rollupPdaState.messages as any[];

    assert.isAbove(messages.length, 0);
    console.log("📨 Messages in PDA:", messages);
  });
});
