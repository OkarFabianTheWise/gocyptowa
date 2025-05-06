// context/init_shared.rs
use crate::constants::*;
use crate::state::SharedPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeSharedPda<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 4 + (10 * (32 + 200)),
        seeds = [SHARED_PDA_SEED],
        bump
    )]
    pub shared_pda: Account<'info, SharedPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
