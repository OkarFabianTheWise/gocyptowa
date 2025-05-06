// instructions/broadcast_event.rs
use crate::context::BroadcastEventCtx;
use crate::state::{BroadcastEvent, EventPayload};
use anchor_lang::prelude::*;

pub fn process(ctx: Context<BroadcastEventCtx>, topic: String, data: Vec<u8>) -> Result<()> {
    let shared = &mut ctx.accounts.shared_pda;

    // Create event with the separate payload structure
    let event = BroadcastEvent {
        topic,
        payload: EventPayload { data },
    };

    shared.events.push(event);
    Ok(())
}
