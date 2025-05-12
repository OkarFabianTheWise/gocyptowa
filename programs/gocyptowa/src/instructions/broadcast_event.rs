// instructions/broadcast_event.rs
use anchor_lang::prelude::*;

use crate::constants::*;
use crate::context::*;
use crate::errors::ErrorCode;
use crate::state::*;

pub fn broadcast_event(
    ctx: Context<BroadcastEventCtx>,
    _rollup_id: u8,
    topic: String,
    payload: Vec<u8>,
) -> Result<()> {
    require!(topic.len() <= MAX_TOPIC_LEN, ErrorCode::TopicTooLong);
    require!(payload.len() <= MAX_CONTENT_LEN, ErrorCode::ContentTooLong);

    let shared_pda = &mut ctx.accounts.shared_pda;
    let source_rollup = &ctx.accounts.source_rollup;

    // Create the broadcast event
    let sequence = shared_pda.last_sequence + 1;
    let event = BroadcastEvent {
        from: source_rollup.key(),
        topic,
        timestamp: Clock::get()?.unix_timestamp,
        payload,
        sequence,
    };

    // Add event to the shared PDA
    if shared_pda.events.len() >= MAX_EVENTS {
        shared_pda.events.remove(0); // Remove oldest event if at capacity
    }
    shared_pda.events.push(event.clone());
    shared_pda.last_sequence = sequence;

    emit!(EventBroadcast {
        from: source_rollup.key(),
        topic: event.topic,
        sequence,
        timestamp: event.timestamp,
    });

    Ok(())
}
