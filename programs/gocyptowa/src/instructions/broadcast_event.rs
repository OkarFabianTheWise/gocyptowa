// route: src/instructions/broadcast_event.rs
use crate::context::broadcast_rollup_event::BroadcastEventCtx;
use crate::state::shared_pda::*;
use anchor_lang::prelude::*;

pub fn handle(ctx: Context<BroadcastEventCtx>, event: BroadcastEvent) -> Result<()> {
    let shared_pda = &mut ctx.accounts.shared_pda;
    shared_pda.global_events.push(event);
    Ok(())
}
