// app/rollup-com/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Idl, workspace } from '@project-serum/anchor';
import idl from '../cross-rollup-comm.json';
// import { CrossRollupComm, Message, Rollup, MessageType, PriceData, CrossRollupCommIDL } from '../cross-rollup-comm';
import { CrossRollupComm } from "../../../../target/types/cross_rollup_comm";


import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import MessageList from '../components/rollup/MessageList';
import SendMessageForm from '../components/rollup/SendMessageForm';
import RollupSelector from '../components/rollup/RollupSelector';
import RollupRegistration from '../components/rollup/RollupRegistration';
import RollupStatus from '../components/rollup/RollupStatus';
import PriceFeed from '../components/rollup/PriceFeed';
import dynamic from 'next/dynamic';
const program = workspace.CrossRollupComm as Program<CrossRollupComm>;

function RollupCommunication() {
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const [activeRollup, setActiveRollup] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [rollups, setRollups] = useState<Rollup[]>([]);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<Program<CrossRollupCommIDL> | null>(null);


  const [prices, setPrices] = useState<PriceData[]>([]);

  const programID = new web3.PublicKey(idl.address);
  const SHARED_PDA_SEED = "shared_pda";
  const REGISTRY_PDA_SEED = "registry_pda";
  const ROLLUP_PDA_SEED = "rollup_pda";
  const PRICE_FEED_SEED = "price_feed";
  const BTC_USD_PAIR = "BTC/USD";

  useEffect(() => {
    if (connected && publicKey) {
      initializeProgram();
    }
  }, [connected, publicKey]);

 const initializeProgram = async () => {
    try {
      setLoading(true);
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
        { commitment: 'confirmed' }
      );
      
      if (!publicKey || !signTransaction || !signAllTransactions) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction,
          signAllTransactions,
        },
        { commitment: 'confirmed' }
      );

      // Make sure to use the correct casing for the IDL
      // Create a modified IDL with correct casing
      const modifiedIdl = {
        ...idl,
        types: [
          ...idl.types,
          {
            name: "MessageType",
            type: {
              kind: "enum",
              variants: [
                { name: "StateUpdate" },
                { name: "CrossRollupMessage" },
                { name: "PriceUpdate" },
                { name: "SystemAnnouncement" }
              ]
            }
          }
        ]
      };

      // Cast the IDL to unknown first, then to the specific type
      const programInstance = new Program(
        (modifiedIdl as unknown) as CrossRollupCommIDL,
        programID,
        provider
      );


      setProgram(programInstance);
      
      await Promise.all([
        fetchRollups(programInstance),
        fetchBroadcasts(programInstance),
        // fetchPrices(programInstance)
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize program:", error);
      setLoading(false);
    }
  };

  const fetchRollups = async (programInstance: Program) => {
    try {
      const [registryPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(REGISTRY_PDA_SEED)],
        programInstance.programId
      );
      
      const registryAccount = await programInstance.account.rollupRegistry.fetch(registryPda);
      setRollups(registryAccount.rollups);
      
      // If there are rollups and no active rollup is selected, select the first one
      if (registryAccount.rollups.length > 0 && activeRollup === null) {
        setActiveRollup(registryAccount.rollups[0].id);
        await fetchRollupMessages(programInstance, registryAccount.rollups[0].id);
      }
    } catch (error) {
      console.error("Error fetching rollups:", error);
    }
  };

  const fetchRollupMessages = async (programInstance: Program, rollupId: number) => {
    try {
      const [rollupPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([rollupId])],
        programInstance.programId
      );
      
      const rollupAccount = await programInstance.account.rollupPda.fetch(rollupPda);
      
      // Format messages for display
      const formattedMessages = rollupAccount.messages.map((msg: any) => ({
        from: msg.from.toString(),
        content: Buffer.from(msg.content).toString('utf-8'),
        timestamp: new Date(msg.timestamp.toNumber()).toLocaleString(),
        messageType: Object.keys(msg.messageType)[0]
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching rollup messages:", error);
    }
  };

  const fetchBroadcasts = async (programInstance: Program) => {
    try {
      const [sharedPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(SHARED_PDA_SEED)],
        programInstance.programId
      );
      
      const sharedAccount = await programInstance.account.sharedPda.fetch(sharedPda);
      
      // Format broadcasts for display
      const formattedBroadcasts = sharedAccount.events.map((event: any) => ({
        from: event.from.toString(),
        topic: event.topic,
        payload: Buffer.from(event.payload).toString('utf-8'),
        timestamp: new Date(event.timestamp.toNumber()).toLocaleString(),
        sequence: event.sequence.toNumber()
      }));
      
      setBroadcasts(formattedBroadcasts);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
    }
  };

  const fetchPrices = async (programInstance: Program) => {
    try {
      const [priceFeedPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(PRICE_FEED_SEED), Buffer.from(BTC_USD_PAIR)],
        programInstance.programId
      );
      
      const priceFeedAccount = await programInstance.account.priceFeed.fetch(priceFeedPda);
      
      // Format prices for display
      const formattedPrices = priceFeedAccount.prices.map((price: any) => ({
        price: price.price.toString(),
        timestamp: new Date(price.timestamp.toNumber()).toLocaleString(),
        source: price.source.toString()
      }));
      
      setPrices(formattedPrices);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  const handleRollupChange = async (rollupId: number) => {
    setActiveRollup(rollupId);
    if (program) {
      await fetchRollupMessages(program, rollupId);
    }
  };

  const handleSendMessage = async (targetRollupId: number, message: string) => {
    if (!program || !connected || !publicKey || !activeRollup) return;
    
    try {
      const [sourceRollupPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([activeRollup])],
        program.programId
      );
      
      const [targetRollupPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([targetRollupId])],
        program.programId
      );
      
      await program.methods
        .sendMessage(
          activeRollup,
          Buffer.from(message),
          { crossRollupMessage: {} }
        )
        .accounts({
          sourceRollupPda: sourceRollupPda,
          targetRollupPda: targetRollupPda,
          sender: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      
      // Refresh messages
      await fetchRollupMessages(program, activeRollup);
      await fetchRollupMessages(program, targetRollupId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleBroadcastEvent = async (topic: string, payload: string) => {
    if (!program || !connected || !publicKey || !activeRollup) return;
    
    try {
      const [sharedPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(SHARED_PDA_SEED)],
        program.programId
      );
      
      const [sourceRollupPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([activeRollup])],
        program.programId
      );
      
      await program.methods
        .broadcastEvent(
          activeRollup,
          topic,
          Buffer.from(payload)
        )
        .accounts({
          sharedPda: sharedPda,
          sourceRollup: sourceRollupPda,
          broadcaster: publicKey,
        })
        .rpc();
      
      // Refresh broadcasts
      await fetchBroadcasts(program);
    } catch (error) {
      console.error("Failed to broadcast event:", error);
    }
  };

  const handleUpdatePrice = async (price: string) => {
    if (!program || !connected || !publicKey || !activeRollup) return;
    
    try {
      const [priceFeedPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(PRICE_FEED_SEED), Buffer.from(BTC_USD_PAIR)],
        program.programId
      );
      
      const [sourceRollupPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([activeRollup])],
        program.programId
      );
      
      await program.methods
        .updatePrice(
          activeRollup,
          BTC_USD_PAIR,
          new BN(price),
          new BN(Date.now())
        )
        .accounts({
          priceFeed: priceFeedPda,
          sourceRollup: sourceRollupPda,
          updater: publicKey,
        })
        .rpc();
      
      // Refresh prices
      await fetchPrices(program);
    } catch (error) {
      console.error("Failed to update price:", error);
    }
  };

  const handleRegisterRollup = async (id: number, name: string, metadata: string) => {
    if (!program || !connected || !publicKey) {
      console.error("Program not initialized or wallet not connected");
      return;
    }
    
    try {
      setLoading(true);
      
      const [rollupPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([id])],
        program.programId
      );
      
      const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(REGISTRY_PDA_SEED)],
        program.programId
      );
      
      console.log("Sending registration transaction...");
      const tx = await program.methods
        .registerRollup(id, name, metadata)
        .accounts({
          rollupPda,
          registry: registryPda,
          owner: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .transaction(); // Get transaction instead of directly sending

      if (!tx || !signTransaction) {
        console.error("Failed to create transaction");
        setLoading(false);
        return;
      }

      // Sign and send the transaction
      const signedTx = await signTransaction(tx);
      const txId = await program.provider.connection.sendRawTransaction(
        signedTx.serialize()
      );
      
      console.log("Transaction sent:", txId);
      await program.provider.connection.confirmTransaction(txId);
      
      // Refresh rollups
      await fetchRollups(program);
      setLoading(false);
    } catch (error) {
      console.error("Failed to register rollup:", error);
      setLoading(false);
    }
};

  const handleUpdateRollupStatus = async (isActive: boolean) => {
    if (!program || !connected || !publicKey || !activeRollup) return;
    
    try {
      const [rollupPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(ROLLUP_PDA_SEED), Buffer.from([activeRollup])],
        program.programId
      );
      
      const [registryPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(REGISTRY_PDA_SEED)],
        program.programId
      );
      
      await program.methods
        .updateRollupStatus(isActive)
        .accounts({
          rollupPda: rollupPda,
          registry: registryPda,
          owner: publicKey,
        })
        .rpc();
      
      // Refresh rollups
      await fetchRollups(program);
    } catch (error) {
      console.error("Failed to update rollup status:", error);
    }
  };

  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cross-Rollup Communication</h1>
        <WalletMultiButton />
      </div>
      
      {!connected ? (
        <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg">
          <p className="text-lg">Connect your wallet to use this app</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-3 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Rollups</h2>
            <RollupSelector 
              rollups={rollups} 
              activeRollup={activeRollup}
              onSelectRollup={handleRollupChange}
            />
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Register New Rollup</h3>
              <RollupRegistration onRegister={handleRegisterRollup} />
            </div>
            
            {activeRollup !== null && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Rollup Status</h3>
                <RollupStatus 
                  rollups={rollups}
                  activeRollup={activeRollup}
                  onUpdateStatus={handleUpdateRollupStatus}
                />
              </div>
            )}
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-6">
            {activeRollup !== null ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {rollups.find(r => r.id === activeRollup)?.name || `Rollup ${activeRollup}`} Messages
                </h2>
                <MessageList messages={messages} />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Send Message</h3>
                  <SendMessageForm 
                    rollups={rollups.filter(r => r.id !== activeRollup)}
                    onSendMessage={handleSendMessage}
                    onBroadcast={handleBroadcastEvent}
                  />
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p>Please select a rollup from the sidebar to view its messages.</p>
              </div>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="lg:col-span-3 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Broadcasted Events</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {broadcasts.length > 0 ? (
                broadcasts.map((broadcast, index) => (
                  <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">{broadcast.timestamp}</div>
                    <div className="font-medium">Topic: {broadcast.topic}</div>
                    <div className="text-sm break-words">{broadcast.payload}</div>
                    <div className="text-xs text-gray-400 mt-1">From: {broadcast.from.substring(0, 8)}...</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No broadcasts yet</p>
              )}
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Price Feed (BTC/USD)</h2>
              <PriceFeed 
                prices={prices} 
                onUpdatePrice={handleUpdatePrice}
                activeRollup={activeRollup}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(RollupCommunication), {
  ssr: false
});