use anchor_lang::prelude::*;
pub mod constants;
pub mod context;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::send_message::SendMessageCtx;
use crate::SendMessageCtx;
use instructions::*;

declare_id!("FkYFD1kZjkb7dRQVaz9pAxnkMEA4iY5dEUmPcRZET8Yq");

#[program]
pub mod gocyptowa {
    use super::*;

    pub fn broadcast_event(
        ctx: Context<context::BroadcastEventCtx>,
        event: state::shared_pda::BroadcastEvent,
    ) -> Result<()> {
        instructions::broadcast_event::handle(ctx, event)
    }

    pub fn send_message(
        ctx: Context<context::SendMessageCtx>,
        message: state::rollup_pda::Message,
    ) -> Result<()> {
        instructions::send_message::handle(ctx, message)
    }
}
