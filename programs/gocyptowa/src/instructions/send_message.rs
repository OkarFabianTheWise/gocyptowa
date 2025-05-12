// instructions/send_message.rs
use anchor_lang::prelude::*;

use crate::constants::*;
use crate::context::*;
use crate::errors::ErrorCode;
use crate::state::*;

pub fn send_message(
    ctx: Context<SendMessageCtx>,
    source_rollup_id: u8,
    content: Vec<u8>,
    msg_type: MessageType,
) -> Result<()> {
    require!(content.len() <= MAX_CONTENT_LEN, ErrorCode::ContentTooLong);

    let target_pda = &mut ctx.accounts.target_rollup_pda;
    let source_pda = &ctx.accounts.source_rollup_pda;

    // Ensure target rollup is not the same as source
    require!(
        target_pda.rollup_id != source_rollup_id,
        ErrorCode::CannotSendToSelf
    );

    // Prepare the message
    let message = Message {
        from: source_pda.key(),
        to: Some(target_pda.key()),
        msg_type,
        timestamp: Clock::get()?.unix_timestamp,
        content,
        sequence: target_pda.messages.len() as u64,
    };

    // Add message to target rollup's PDA
    if target_pda.messages.len() >= MAX_MESSAGES {
        target_pda.messages.remove(0); // Remove oldest message if at capacity
    }
    target_pda.messages.push(message.clone());

    emit!(MessageSent {
        from: source_pda.key(),
        to: target_pda.key(),
        sequence: message.sequence,
        timestamp: message.timestamp,
    });

    Ok(())
}

pub fn mark_messages_as_read(
    ctx: Context<ReadMessagesCtx>,
    _rollup_id: u8,
    _reader_rollup_id: u8,
    sequence: u64,
) -> Result<()> {
    let reader_rollup = &mut ctx.accounts.reader_rollup;

    // Update the last processed sequence
    reader_rollup.last_processed_sequence = sequence;

    Ok(())
}

pub fn update_price(
    ctx: Context<UpdatePriceFeedCtx>,
    _rollup_id: u8,
    pair: String,
    price: u64,
    decimals: u8,
) -> Result<()> {
    let price_feed = &mut ctx.accounts.price_feed;
    let source_rollup = &ctx.accounts.source_rollup;
    let timestamp = Clock::get()?.unix_timestamp;

    // Create the price data
    let price_data = PriceData {
        price,
        decimals,
        timestamp,
        source: source_rollup.key(),
    };

    // Add price to the price feed
    if price_feed.prices.len() >= 10 {
        price_feed.prices.remove(0); // Remove oldest price if at capacity
    }
    price_feed.prices.push(price_data);
    price_feed.last_update = timestamp;

    emit!(PriceUpdated {
        pair: pair.clone(),
        price,
        decimals,
        source: source_rollup.key(),
        timestamp,
    });

    Ok(())
}
