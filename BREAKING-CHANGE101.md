# Cross Rollup Communication Protocol

A Solana program built with Anchor that enables secure communication between different rollups.

## Overview

This protocol allows different rollups to:

- Register in a central registry
- Send direct messages to other rollups
- Broadcast events to all rollups
- Update price feeds
- Track message processing status

## Project Structure

```
programs/gocyptowa/
├── src/
│   ├── constants.rs        # Program constants and configuration
│   ├── context/            # Account validation structs
│   │   ├── mod.rs
│   │   ├── broadcast_event.rs
│   │   ├── init_rollup.rs
│   │   ├── init_shared.rs
│   │   └── send_message.rs
│   ├── errors.rs           # Custom error types
│   ├── instructions/       # Instruction logic
│   │   ├── mod.rs
│   │   ├── broadcast_event.rs
│   │   ├── init_rollup.rs
│   │   ├── init_shared.rs
│   │   └── send_message.rs
│   ├── lib.rs              # Main program entry points
│   ├── state.rs            # Program account state definitions
│   └── utils.rs            # Utility functions
```

## Key Components

1. **RollupPda** - Stores rollup-specific data and received messages
2. **SharedPda** - Central storage for broadcast events
3. **RollupRegistry** - Maintains a list of all registered rollups
4. **PriceFeed** - Stores price data published by rollups

## Getting Started

1. Build the program:
   ```
   anchor build
   ```

2. Deploy to Solana network:
   ```
   anchor deploy
   ```

3. Initialize the protocol:
   ```typescript
   // Create shared PDA
   await program.methods.initializeSharedPda().accounts({...}).rpc();
   
   // Create registry
   await program.methods.initializeRegistry().accounts({...}).rpc();
   ```

4. Register a rollup:
   ```typescript
   await program.methods
     .registerRollup(rollupId, name, metadata)
     .accounts({...})
     .rpc();
   ```

## Testing

Run the test suite:
```
anchor test
```

## License

[MIT](LICENSE)
