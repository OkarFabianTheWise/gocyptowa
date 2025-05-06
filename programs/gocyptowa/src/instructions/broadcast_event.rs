// instructions/broadcast_event.rs
use crate::context::broadcast_event::BroadcastEventCtx;
use crate::state::{BroadcastEvent, EventPayload};
use anchor_lang::prelude::*;

pub fn handle(ctx: Context<BroadcastEventCtx>, topic: String, data: Vec<u8>) -> Result<()> {
    let shared = &mut ctx.accounts.shared_pda;
    let event = BroadcastEvent {
        topic,
        payload: EventPayload { data },
    };
    shared.events.push(event);
    Ok(())
}
