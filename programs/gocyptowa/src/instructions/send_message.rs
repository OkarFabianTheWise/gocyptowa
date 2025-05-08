// instructions/send_message.rs
use crate::constants::{MAX_CONTENT_LEN, MAX_MESSAGES};
use crate::context::SendMessageCtx;
use crate::state::Message;
use anchor_lang::prelude::*;

pub fn process(ctx: Context<SendMessageCtx>, _rollup_id: u8, message: Message) -> Result<()> {
    let pda = &mut ctx.accounts.rollup_pda;

    // Validate message content length
    if message.content.len() > MAX_CONTENT_LEN {
        return Err(ProgramError::InvalidArgument.into());
    }

    // Check if maximum messages is reached
    if pda.messages.len() >= MAX_MESSAGES {
        return Err(ProgramError::AccountDataTooSmall.into());
    }

    pda.messages.push(message);
    Ok(())
}
