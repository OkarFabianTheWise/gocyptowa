// instructions/init_shared.rs
use anchor_lang::prelude::*;

use crate::constants::*;
use crate::context::*;

pub fn initialize_shared_pda(ctx: Context<InitializeSharedPdaCtx>) -> Result<()> {
    let shared_pda = &mut ctx.accounts.shared_pda;
    shared_pda.events = Vec::with_capacity(MAX_EVENTS);
    shared_pda.last_sequence = 0;
    shared_pda.bump = ctx.bumps.shared_pda;
    Ok(())
}
