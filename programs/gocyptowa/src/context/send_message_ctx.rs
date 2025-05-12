// context/send_message.rs
use crate::constants::*;
use crate::state::{PriceFeed, RollupPda};
use anchor_lang::prelude::*;

// Send a direct message from one rollup to another
#[derive(Accounts)]
#[instruction(source_rollup_id: u8)]
pub struct SendMessageCtx<'info> {
    #[account(
        mut,
        seeds = [ROLLUP_PDA_SEED, &target_rollup_pda.rollup_id.to_le_bytes()],
        bump = target_rollup_pda.bump
    )]
    pub target_rollup_pda: Account<'info, RollupPda>,

    // Verify the sender is authorized for the source rollup
    #[account(
        seeds = [ROLLUP_PDA_SEED, &source_rollup_id.to_le_bytes()],
        bump,
        constraint = source_rollup_pda.owner == sender.key()
    )]
    pub source_rollup_pda: Account<'info, RollupPda>,

    #[account(mut)]
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Read messages from a rollup
#[derive(Accounts)]
#[instruction(rollup_id: u8, reader_rollup_id: u8)]
pub struct ReadMessagesCtx<'info> {
    #[account(
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump = rollup_pda.bump
    )]
    pub rollup_pda: Account<'info, RollupPda>,

    // Verify the reader is a registered rollup
    #[account(
        seeds = [ROLLUP_PDA_SEED, &reader_rollup_id.to_le_bytes()],
        bump,
        constraint = reader_rollup.owner == reader.key()
    )]
    pub reader_rollup: Account<'info, RollupPda>,

    pub reader: Signer<'info>,
}

// Update a price feed
#[derive(Accounts)]
#[instruction(rollup_id: u8, pair: String)]
pub struct UpdatePriceFeedCtx<'info> {
    #[account(
        mut,
        seeds = [PRICE_FEED_SEED, pair.as_bytes()],
        bump = price_feed.bump
    )]
    pub price_feed: Account<'info, PriceFeed>,

    // Verify the updater is a registered rollup
    #[account(
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump,
        constraint = source_rollup.owner == updater.key()
    )]
    pub source_rollup: Account<'info, RollupPda>,

    #[account(mut)]
    pub updater: Signer<'info>,
}
