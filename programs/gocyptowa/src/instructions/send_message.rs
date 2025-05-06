use crate::context::SendMessageCtx;
use crate::state::rollup_pda::*;
use anchor_lang::prelude::*;

pub fn handle(ctx: Context<SendMessageCtx>, message: Message) -> Result<()> {
    let rollup_pda = &mut ctx.accounts.rollup_pda;
    rollup_pda.messages.push(message);
    Ok(())
}
