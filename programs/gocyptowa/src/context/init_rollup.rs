// initialization context for RollupPda
use crate::constants::{MAX_CONTENT_LEN, MAX_MESSAGES, ROLLUP_PDA_SEED};
use crate::state::RollupPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(rollup_id: u8)]
pub struct InitializeRollupPda<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + // Discriminator
               4 + // Vec length
               (MAX_MESSAGES * (
                   32 + // Pubkey size
                   4 + MAX_CONTENT_LEN // String with max content length
               )),
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump
    )]
    pub rollup_pda: Account<'info, RollupPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
