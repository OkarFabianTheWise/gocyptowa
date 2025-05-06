use anchor_lang::prelude::*;

#[error_code]
pub enum GocyptowaError {
    #[msg("Invalid message format")]
    InvalidMessage,
    #[msg("Invalid event format")]
    InvalidEvent,
    #[msg("Unauthorized access")]
    Unauthorized,
}
