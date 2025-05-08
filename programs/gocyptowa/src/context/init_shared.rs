// context/init_shared.rs
use crate::constants::{MAX_EVENTS, MAX_PAYLOAD_LEN, MAX_TOPIC_LEN, SHARED_PDA_SEED};
use crate::state::SharedPda;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeSharedPda<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + // Discriminator
               4 + // Vec length
               (MAX_EVENTS * (
                   4 + MAX_TOPIC_LEN + // topic (String with max length)
                   4 + MAX_PAYLOAD_LEN  // payload data (Vec with max length)
               )),
        seeds = [SHARED_PDA_SEED],
        bump
    )]
    pub shared_pda: Account<'info, SharedPda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
