use anchor_lang::prelude::*;

#[account]
pub struct RollupPda {
    pub messages: Vec<Message>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Message {
    pub sender_rollup_id: u8,
    pub payload_type: u8,
    pub payload: Vec<u8>,
    pub timestamp: i64,
}
