use anchor_lang::prelude::*;

pub mod constants;
pub mod context;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::context::broadcast_rollup_event::BroadcastEventCtx;
use crate::context::send_rollup_message::SendMessageCtx;
use instructions::*;

declare_id!("FkYFD1kZjkb7dRQVaz9pAxnkMEA4iY5dEUmPcRZET8Yq");

#[program]
pub mod gocyptowa {
    use super::*;

    pub fn broadcast_event(
        ctx: Context<BroadcastEventCtx>,
        event: state::shared_pda::BroadcastEvent,
    ) -> Result<()> {
        instructions::broadcast_rollup_event::handle(ctx, event)
    }

    pub fn send_message(
        ctx: Context<SendMessageCtx>,
        rollup_id: u8,
        message: state::rollup_pda::Message,
    ) -> Result<()> {
        instructions::send_rollup_message::handle(ctx, rollup_id, message)
    }
}
