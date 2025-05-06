// route: src/context/send_message.rs
use crate::constants::*;
use crate::state::rollup_pda::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(rollup_id: u8)]
pub struct SendMessageCtx<'info> {
    #[account(mut, seeds = [ROLLUP_PDA_SEED, &[rollup_id]], bump)]
    pub rollup_pda: Account<'info, RollupPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> SendMessageCtx<'info> {
    pub fn rollup_id(&self) -> u8 {
        // logic to extract rollup_id from PDA if needed
        0
    }
}
