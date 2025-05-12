// route: src/context/broadcast_event.rs
use crate::constants::*;
use crate::state::{RollupPda, SharedPda};
use anchor_lang::prelude::*;

// Broadcast an event to all rollups via the shared PDA
#[derive(Accounts)]
#[instruction(rollup_id: u8)]
pub struct BroadcastEventCtx<'info> {
    #[account(
        mut,
        seeds = [SHARED_PDA_SEED],
        bump = shared_pda.bump
    )]
    pub shared_pda: Account<'info, SharedPda>,

    // Verify the broadcaster is a registered rollup
    #[account(
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump,
        constraint = source_rollup.owner == broadcaster.key()
    )]
    pub source_rollup: Account<'info, RollupPda>,

    #[account(mut)]
    pub broadcaster: Signer<'info>,
}
