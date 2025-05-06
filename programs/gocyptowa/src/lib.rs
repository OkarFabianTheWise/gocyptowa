// lib.rs
use anchor_lang::prelude::*;
pub mod constants;
pub mod context;
pub mod instructions;
pub mod state;

use context::broadcast_event::BroadcastEventCtx;
use context::init_shared::InitializeSharedPda;
use context::send_message::SendMessageCtx;
use instructions::*;
use instructions::*;
use state::Message;

declare_id!("FkYFD1kZjkb7dRQVaz9pAxnkMEA4iY5dEUmPcRZET8Yq");

#[program]
pub mod gocyptowa {
    use super::*;

    pub fn send_message(
        ctx: Context<SendMessageCtx>,
        rollup_id: u8,
        message: Message,
    ) -> Result<()> {
        send_message::handle(ctx, rollup_id, message)
    }

    pub fn broadcast_event(
        ctx: Context<BroadcastEventCtx>,
        topic: String,
        data: Vec<u8>,
    ) -> Result<()> {
        broadcast_event::handle(ctx, topic, data)
    }

    pub fn initialize_shared_pda(ctx: Context<InitializeSharedPda>) -> Result<()> {
        init_shared::handle(ctx)
    }
}
