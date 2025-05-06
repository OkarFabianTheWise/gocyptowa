// instructions/init_shared.rs
use crate::context::init_shared::InitializeSharedPda;
use anchor_lang::prelude::*;

pub fn handle(ctx: Context<InitializeSharedPda>) -> Result<()> {
    ctx.accounts.shared_pda.events = Vec::new();
    Ok(())
}
