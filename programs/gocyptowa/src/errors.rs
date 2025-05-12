use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Content exceeds maximum allowed length")]
    ContentTooLong,

    #[msg("Topic exceeds maximum allowed length")]
    TopicTooLong,

    #[msg("Name exceeds maximum allowed length")]
    NameTooLong,

    #[msg("Metadata exceeds maximum allowed length")]
    MetadataTooLong,

    #[msg("Rollup ID already exists")]
    RollupIdAlreadyExists,

    #[msg("Rollup not found in registry")]
    RollupNotFound,

    #[msg("Cannot send message to self")]
    CannotSendToSelf,

    #[msg("Message queue is full")]
    MessageQueueFull,
}
