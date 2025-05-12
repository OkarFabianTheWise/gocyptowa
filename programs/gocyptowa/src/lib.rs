use anchor_lang::prelude::*;

pub mod constants;
pub mod context;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;
pub use context::*;
use instructions::*;

declare_id!("GZ5WFnojWrqmvkUq75xZkTbvL4kAkvPFJA3pvHX5fv8K");

/// Program implementation
#[program]
pub mod cross_rollup_comm {
    use super::*;

    // --- Initialization Functions ---
    pub fn initialize_shared_pda(ctx: Context<InitializeSharedPdaCtx>) -> Result<()> {
        init_shared::initialize_shared_pda(ctx)
    }

    pub fn initialize_registry(ctx: Context<InitializeRegistryCtx>) -> Result<()> {
        init_rollup::initialize_registry(ctx)
    }

    pub fn initialize_price_feed(ctx: Context<InitializePriceFeedCtx>, pair: String) -> Result<()> {
        init_rollup::initialize_price_feed(ctx, pair)
    }

    // --- Registry Functions ---
    pub fn register_rollup(
        ctx: Context<RegisterRollupCtx>,
        rollup_id: u8,
        name: String,
        metadata: String,
    ) -> Result<()> {
        init_rollup::register_rollup(ctx, rollup_id, name, metadata)
    }

    pub fn update_rollup_metadata(
        ctx: Context<UpdateRollupMetadataCtx>,
        metadata: String,
    ) -> Result<()> {
        init_rollup::update_rollup_metadata(ctx, metadata)
    }

    pub fn deactivate_rollup(ctx: Context<UpdateRollupStatusCtx>) -> Result<()> {
        init_rollup::deactivate_rollup(ctx)
    }

    pub fn reactivate_rollup(ctx: Context<UpdateRollupStatusCtx>) -> Result<()> {
        init_rollup::reactivate_rollup(ctx)
    }

    // --- Message Functions ---
    pub fn send_message(
        ctx: Context<SendMessageCtx>,
        source_rollup_id: u8,
        content: Vec<u8>,
        msg_type: state::MessageType,
    ) -> Result<()> {
        send_message::send_message(ctx, source_rollup_id, content, msg_type)
    }

    pub fn broadcast_event(
        ctx: Context<BroadcastEventCtx>,
        rollup_id: u8,
        topic: String,
        payload: Vec<u8>,
    ) -> Result<()> {
        broadcast_event::broadcast_event(ctx, rollup_id, topic, payload)
    }

    pub fn update_price(
        ctx: Context<UpdatePriceFeedCtx>,
        rollup_id: u8,
        pair: String,
        price: u64,
        decimals: u8,
    ) -> Result<()> {
        send_message::update_price(ctx, rollup_id, pair, price, decimals)
    }

    pub fn mark_messages_as_read(
        ctx: Context<ReadMessagesCtx>,
        rollup_id: u8,
        reader_rollup_id: u8,
        sequence: u64,
    ) -> Result<()> {
        send_message::mark_messages_as_read(ctx, rollup_id, reader_rollup_id, sequence)
    }
}
