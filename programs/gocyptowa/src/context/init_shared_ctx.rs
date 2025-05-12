// src/context/init_shared.rs
use crate::constants::*;
use crate::state::SharedPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeSharedPdaCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 4 + (MAX_EVENTS * (32 + 4 + MAX_TOPIC_LEN + 8 + 4 + MAX_CONTENT_LEN + 8)) + 8 + 1,
        seeds = [SHARED_PDA_SEED],
        bump
    )]
    pub shared_pda: Account<'info, SharedPda>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
