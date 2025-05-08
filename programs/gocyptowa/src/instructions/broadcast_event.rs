// instructions/broadcast_event.rs
use crate::constants::{MAX_EVENTS, MAX_PAYLOAD_LEN, MAX_TOPIC_LEN};
use crate::context::BroadcastEventCtx;
use crate::state::{BroadcastEvent, EventPayload};
use anchor_lang::prelude::*;

pub fn process(ctx: Context<BroadcastEventCtx>, topic: String, data: Vec<u8>) -> Result<()> {
    let shared = &mut ctx.accounts.shared_pda;

    // Validate input lengths
    if topic.len() > MAX_TOPIC_LEN {
        return Err(ProgramError::InvalidArgument.into());
    }

    if data.len() > MAX_PAYLOAD_LEN {
        return Err(ProgramError::InvalidArgument.into());
    }

    // Check if maximum events is reached
    if shared.events.len() >= MAX_EVENTS {
        return Err(ProgramError::AccountDataTooSmall.into());
    }

    // Create event with the separate payload structure
    let event = BroadcastEvent {
        topic,
        payload: EventPayload { data },
    };

    shared.events.push(event);
    Ok(())
}
