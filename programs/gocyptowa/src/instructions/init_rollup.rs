// src/instructions/init_rollup.rs
use anchor_lang::prelude::*;

use crate::constants::*;
use crate::context::*;
use crate::errors::ErrorCode;
use crate::state::*;

pub fn initialize_registry(ctx: Context<InitializeRegistryCtx>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    registry.rollups = Vec::new();
    registry.bump = ctx.bumps.registry;
    Ok(())
}

pub fn initialize_price_feed(ctx: Context<InitializePriceFeedCtx>, pair: String) -> Result<()> {
    let price_feed = &mut ctx.accounts.price_feed;
    price_feed.pair = pair;
    price_feed.prices = Vec::with_capacity(10);
    price_feed.last_update = 0;
    price_feed.bump = ctx.bumps.price_feed;
    Ok(())
}

pub fn register_rollup(
    ctx: Context<RegisterRollupCtx>,
    rollup_id: u8,
    name: String,
    metadata: String,
) -> Result<()> {
    require!(name.len() <= 50, ErrorCode::NameTooLong);
    require!(metadata.len() <= 100, ErrorCode::MetadataTooLong);

    // Check if rollup_id already exists
    for rollup in &ctx.accounts.registry.rollups {
        if rollup.id == rollup_id {
            return err!(ErrorCode::RollupIdAlreadyExists);
        }
    }

    // Initialize the rollup PDA
    let rollup_pda = &mut ctx.accounts.rollup_pda;
    rollup_pda.rollup_id = rollup_id;
    rollup_pda.owner = ctx.accounts.owner.key();
    rollup_pda.name = name.clone();
    rollup_pda.messages = Vec::with_capacity(MAX_MESSAGES);
    rollup_pda.last_processed_sequence = 0;
    rollup_pda.bump = ctx.bumps.rollup_pda;

    // Register rollup in the registry
    let registry = &mut ctx.accounts.registry;
    let rollup_info = RollupInfo {
        id: rollup_id,
        name,
        owner: ctx.accounts.owner.key(),
        pda_address: ctx.accounts.rollup_pda.key(),
        active: true,
        metadata,
    };

    registry.rollups.push(rollup_info);

    emit!(RollupRegistered {
        rollup_id,
        owner: ctx.accounts.owner.key(),
        pda_address: ctx.accounts.rollup_pda.key()
    });

    Ok(())
}

pub fn update_rollup_metadata(
    ctx: Context<UpdateRollupMetadataCtx>,
    metadata: String,
) -> Result<()> {
    require!(metadata.len() <= 100, ErrorCode::MetadataTooLong);

    let registry = &mut ctx.accounts.registry;
    let rollup_id = ctx.accounts.rollup_pda.rollup_id;

    // Find and update the rollup info
    for rollup in &mut registry.rollups {
        if rollup.id == rollup_id {
            rollup.metadata = metadata;
            return Ok(());
        }
    }

    err!(ErrorCode::RollupNotFound)
}

pub fn deactivate_rollup(ctx: Context<UpdateRollupStatusCtx>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    let rollup_id = ctx.accounts.rollup_pda.rollup_id;

    // Find and update the rollup status
    for rollup in &mut registry.rollups {
        if rollup.id == rollup_id {
            rollup.active = false;

            emit!(RollupStatusChanged {
                rollup_id,
                active: false
            });

            return Ok(());
        }
    }

    err!(ErrorCode::RollupNotFound)
}

pub fn reactivate_rollup(ctx: Context<UpdateRollupStatusCtx>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    let rollup_id = ctx.accounts.rollup_pda.rollup_id;

    // Find and update the rollup status
    for rollup in &mut registry.rollups {
        if rollup.id == rollup_id {
            rollup.active = true;

            emit!(RollupStatusChanged {
                rollup_id,
                active: true
            });

            return Ok(());
        }
    }

    err!(ErrorCode::RollupNotFound)
}
