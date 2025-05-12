use crate::constants::*;
use crate::state::{RollupPda, RollupRegistry};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(rollup_id: u8, name: String)]
pub struct RegisterRollupCtx<'info> {
    #[account(
        init,
        payer = owner,
        // Reduced MAX_MESSAGES and ensuring we use constants properly
        space = 8 + 1 + 32 + 4 + 50 + 4 + (MAX_MESSAGES * (32 + 33 + 1 + 8 + 4 + MAX_CONTENT_LEN + 8)) + 8 + 1,
        seeds = [ROLLUP_PDA_SEED, &rollup_id.to_le_bytes()],
        bump
    )]
    pub rollup_pda: Account<'info, RollupPda>,

    #[account(
        mut,
        seeds = [REGISTRY_PDA_SEED],
        bump = registry.bump
    )]
    pub registry: Account<'info, RollupRegistry>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeRegistryCtx<'info> {
    #[account(
        init,
        payer = payer,
        // Reduced from 50 entries to 15 to stay within 10KB limit
        space = 8 + 4 + (15 * (1 + 4 + 50 + 32 + 32 + 1 + 4 + 100)) + 1,
        seeds = [REGISTRY_PDA_SEED],
        bump
    )]
    pub registry: Account<'info, RollupRegistry>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Context for updating rollup metadata
#[derive(Accounts)]
pub struct UpdateRollupMetadataCtx<'info> {
    #[account(
        mut,
        seeds = [REGISTRY_PDA_SEED],
        bump = registry.bump
    )]
    pub registry: Account<'info, RollupRegistry>,

    #[account(
        seeds = [ROLLUP_PDA_SEED, &rollup_pda.rollup_id.to_le_bytes()],
        bump = rollup_pda.bump,
        constraint = rollup_pda.owner == owner.key()
    )]
    pub rollup_pda: Account<'info, RollupPda>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

// Context for updating rollup status
#[derive(Accounts)]
pub struct UpdateRollupStatusCtx<'info> {
    #[account(
        mut,
        seeds = [REGISTRY_PDA_SEED],
        bump = registry.bump
    )]
    pub registry: Account<'info, RollupRegistry>,

    #[account(
        seeds = [ROLLUP_PDA_SEED, &rollup_pda.rollup_id.to_le_bytes()],
        bump = rollup_pda.bump,
        constraint = rollup_pda.owner == owner.key()
    )]
    pub rollup_pda: Account<'info, RollupPda>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(pair: String)]
pub struct InitializePriceFeedCtx<'info> {
    #[account(
        init,
        payer = payer,
        // Price feed size calculation looks good as is
        space = 8 + 4 + 20 + 4 + (10 * (8 + 1 + 8 + 32)) + 8 + 1,
        seeds = [PRICE_FEED_SEED, pair.as_bytes()],
        bump
    )]
    pub price_feed: Account<'info, crate::state::PriceFeed>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
