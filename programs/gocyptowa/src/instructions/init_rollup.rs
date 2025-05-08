// src/instructions/init_rollup.rs
use crate::context::InitializeRollupPda;
use anchor_lang::prelude::*;

pub fn process(ctx: Context<InitializeRollupPda>) -> Result<()> {
    ctx.accounts.rollup_pda.messages = Vec::new();
    Ok(())
}
