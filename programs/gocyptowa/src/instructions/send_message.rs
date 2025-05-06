// instructions/send_message.rs
use crate::context::SendMessageCtx;
use crate::state::Message;
use anchor_lang::prelude::*;

pub fn process(ctx: Context<SendMessageCtx>, _rollup_id: u8, message: Message) -> Result<()> {
    let pda = &mut ctx.accounts.rollup_pda;
    pda.messages.push(message);
    Ok(())
}
