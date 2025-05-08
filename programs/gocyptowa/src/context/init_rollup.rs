// initialization context for RollupPda
use crate::constants::*;
use crate::state::RollupPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(rollup_id: u8)]
pub struct InitializeRollupPda<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 4 + (10 * (32 + 200)), // Space for header + vec len + estimated messages size
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump
    )]
    pub rollup_pda: Account<'info, RollupPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
