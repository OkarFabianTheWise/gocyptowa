use anchor_lang::prelude::*;

pub mod constants;
pub mod context;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use constants::*;
use context::*;
use instructions::*;

declare_id!("BgVCaSj3YyfAxnDJZ4YrBag7CCTc8fPPqY7NEr9sh9Cr");

#[program]
pub mod gocyptowa {
    use super::*;

    pub fn send_message(
        ctx: Context<SendMessageCtx>,
        rollup_id: u8,
        message: state::Message,
    ) -> Result<()> {
        instructions::send_message::process(ctx, rollup_id, message)
    }

    pub fn broadcast_event(
        ctx: Context<BroadcastEventCtx>,
        topic: String,
        data: Vec<u8>,
    ) -> Result<()> {
        instructions::broadcast_event::process(ctx, topic, data)
    }

    pub fn initialize_shared_pda(ctx: Context<InitializeSharedPda>) -> Result<()> {
        instructions::init_shared::process(ctx)
    }

    pub fn initialize_rollup_pda(ctx: Context<InitializeRollupPda>, _rollup_id: u8) -> Result<()> {
        instructions::init_rollup::process(ctx)
    }
}
