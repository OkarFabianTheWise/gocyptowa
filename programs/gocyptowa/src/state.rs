// src/state.rs
use crate::constants::*;
use anchor_lang::prelude::*;

/// Data Types

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum MessageType {
    StateUpdate,
    CrossRollupMessage,
    PriceUpdate,
    SystemAnnouncement,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Message {
    pub from: Pubkey,       // Source rollup
    pub to: Option<Pubkey>, // Target rollup if direct message, None if broadcast
    pub msg_type: MessageType,
    pub timestamp: i64,
    pub content: Vec<u8>, // Message payload as bytes for flexibility
    pub sequence: u64,    // Sequence number for ordering
}

#[account]
#[derive(Default)]
pub struct RollupPda {
    pub rollup_id: u8,
    pub owner: Pubkey,                // Authority that can write to this PDA
    pub name: String,                 // Human-readable name
    pub messages: Vec<Message>,       // Using VecDeque for efficient FIFO
    pub last_processed_sequence: u64, // For tracking processed messages
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct BroadcastEvent {
    pub from: Pubkey, // Source rollup
    pub topic: String,
    pub timestamp: i64,
    pub payload: Vec<u8>, // Event data
    pub sequence: u64,
}

#[account]
#[derive(Default)]
pub struct SharedPda {
    pub events: Vec<BroadcastEvent>,
    pub last_sequence: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RollupInfo {
    pub id: u8,
    pub name: String,
    pub owner: Pubkey,
    pub pda_address: Pubkey,
    pub active: bool,
    pub metadata: String, // Additional metadata in JSON format
}

#[account]
#[derive(Default)]
pub struct RollupRegistry {
    pub rollups: Vec<RollupInfo>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PriceData {
    pub price: u64,     // Price in smallest units (e.g., lamports)
    pub decimals: u8,   // Decimal places
    pub timestamp: i64, // When the price was updated
    pub source: Pubkey, // Who provided this price
}

#[account]
#[derive(Default)]
pub struct PriceFeed {
    pub pair: String, // Price pair (e.g., "SOL/USD")
    pub prices: Vec<PriceData>,
    pub last_update: i64,
    pub bump: u8,
}

// Events
#[event]
pub struct RollupRegistered {
    pub rollup_id: u8,
    pub owner: Pubkey,
    pub pda_address: Pubkey,
}

#[event]
pub struct RollupStatusChanged {
    pub rollup_id: u8,
    pub active: bool,
}

#[event]
pub struct MessageSent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub sequence: u64,
    pub timestamp: i64,
}

#[event]
pub struct EventBroadcast {
    pub from: Pubkey,
    pub topic: String,
    pub sequence: u64,
    pub timestamp: i64,
}

#[event]
pub struct PriceUpdated {
    pub pair: String,
    pub price: u64,
    pub decimals: u8,
    pub source: Pubkey,
    pub timestamp: i64,
}
