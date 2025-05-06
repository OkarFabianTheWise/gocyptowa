// route: src/context/broadcast_event.rs
use crate::constants::*;
use crate::state::SharedPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct BroadcastEventCtx<'info> {
    #[account(mut, seeds = [SHARED_PDA_SEED], bump)]
    pub shared_pda: Account<'info, SharedPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
}
