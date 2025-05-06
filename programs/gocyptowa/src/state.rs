use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Message {
    pub from: Pubkey,
    pub content: String,
}

#[account]
pub struct RollupPda {
    pub messages: Vec<Message>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct EventPayload {
    pub data: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct BroadcastEvent {
    pub topic: String,
    pub payload: EventPayload,
}

#[account]
pub struct SharedPda {
    pub events: Vec<BroadcastEvent>,
}
