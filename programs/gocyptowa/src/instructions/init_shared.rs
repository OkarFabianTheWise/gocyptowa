// instructions/init_shared.rs
use crate::context::InitializeSharedPda;
use anchor_lang::prelude::*;

pub fn process(ctx: Context<InitializeSharedPda>) -> Result<()> {
    ctx.accounts.shared_pda.events = Vec::new();
    Ok(())
}
