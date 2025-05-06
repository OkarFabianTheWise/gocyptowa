use anchor_lang::prelude::*;

#[account]
pub struct SharedPda {
    pub global_events: Vec<BroadcastEvent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BroadcastEvent {
    pub event_type: u8,
    pub emitting_rollup_id: u8,
    pub target_rollup_id: Option<u8>,
    pub data: Vec<u8>,
    pub timestamp: i64,
}
