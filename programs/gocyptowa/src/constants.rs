// src/constants.rs
// Constants for PDA seeds
pub const SHARED_PDA_SEED: &[u8] = b"shared_pda";
pub const ROLLUP_PDA_SEED: &[u8] = b"rollup_pda";
pub const REGISTRY_PDA_SEED: &[u8] = b"registry_pda";
pub const PRICE_FEED_SEED: &[u8] = b"price_feed";

// Maximum values to prevent excessive size
pub const MAX_MESSAGES: usize = 5;
pub const MAX_EVENTS: usize = 8;
pub const MAX_CONTENT_LEN: usize = 256;
pub const MAX_TOPIC_LEN: usize = 32;
