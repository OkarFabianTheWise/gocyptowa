use anchor_lang::prelude::*;

#[error_code]
pub enum GocyptowaError {
    #[msg("Unauthorized write attempt to PDA")]
    Unauthorized,
    #[msg("Invalid message format")]
    InvalidMessage,
    #[msg("Rollup not registered")]
    RollupNotRegistered,
}
