// context/send_message.rs
use crate::constants::*;
use crate::state::RollupPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(rollup_id: u8)]
pub struct SendMessageCtx<'info> {
    #[account(
        mut,
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump
    )]
    pub rollup_pda: Account<'info, RollupPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
