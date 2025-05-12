/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/cross_rollup_comm.json`.
 */
import { PublicKey } from '@solana/web3.js';
import { BN, Idl } from '@project-serum/anchor';
import { IdlTypeDef } from '@project-serum/anchor/dist/cjs/idl';

export type PriceData = {
  price: BN;
  decimals: number;
  timestamp: BN;
  source: PublicKey;
};

export type Message = {
  from: PublicKey;
  content: Buffer;
  messageType: MessageType;
  timestamp: BN;
};

export type Rollup = {
  id: number;
  name: string;
  owner: PublicKey;
  pdaAddress: PublicKey;
  active: boolean;
  metadata: string;
};

export interface CrossRollupCommIDL extends Idl {
  version: "0.1.0";
  name: "cross_rollup_comm";
  instructions: Array<any>;
  accounts: Array<any>;
  types: IdlTypeDef[];
}

// Update MessageType to match IDL definition
export type MessageType = {
  kind: "enum";
  variants: [
    { name: "stateUpdate" },
    { name: "crossRollupMessage" },
    { name: "priceUpdate" },
    { name: "systemAnnouncement" }
  ];
};
export type CrossRollupComm = {
  "address": "GZ5WFnojWrqmvkUq75xZkTbvL4kAkvPFJA3pvHX5fv8K",
  "metadata": {
    "name": "crossRollupComm",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Cross Rollup Communication Protocol for Solana"
  },
  "docs": [
    "Program implementation"
  ],
  "instructions": [
    {
      "name": "broadcastEvent",
      "discriminator": [
        174,
        108,
        243,
        222,
        235,
        228,
        217,
        230
      ],
      "accounts": [
        {
          "name": "sharedPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101,
                  100,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "sourceRollup",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "rollupId"
              }
            ]
          }
        },
        {
          "name": "broadcaster",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "rollupId",
          "type": "u8"
        },
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "payload",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "deactivateRollup",
      "discriminator": [
        241,
        1,
        74,
        191,
        121,
        174,
        193,
        16
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "rollupPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "rollup_pda.rollup_id",
                "account": "rollupPda"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializePriceFeed",
      "discriminator": [
        68,
        180,
        81,
        20,
        102,
        213,
        145,
        233
      ],
      "accounts": [
        {
          "name": "priceFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  105,
                  99,
                  101,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "pair"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pair",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeRegistry",
      "discriminator": [
        189,
        181,
        20,
        17,
        174,
        57,
        249,
        59
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeSharedPda",
      "discriminator": [
        77,
        52,
        6,
        209,
        211,
        0,
        155,
        142
      ],
      "accounts": [
        {
          "name": "sharedPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101,
                  100,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "markMessagesAsRead",
      "discriminator": [
        203,
        7,
        78,
        211,
        18,
        199,
        134,
        172
      ],
      "accounts": [
        {
          "name": "rollupPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "rollupId"
              }
            ]
          }
        },
        {
          "name": "readerRollup",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "readerRollupId"
              }
            ]
          }
        },
        {
          "name": "reader",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "rollupId",
          "type": "u8"
        },
        {
          "name": "readerRollupId",
          "type": "u8"
        },
        {
          "name": "sequence",
          "type": "u64"
        }
      ]
    },
    {
      "name": "reactivateRollup",
      "discriminator": [
        141,
        119,
        35,
        43,
        178,
        206,
        120,
        239
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "rollupPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "rollup_pda.rollup_id",
                "account": "rollupPda"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "registerRollup",
      "discriminator": [
        227,
        174,
        112,
        207,
        206,
        119,
        51,
        183
      ],
      "accounts": [
        {
          "name": "rollupPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "rollupId"
              }
            ]
          }
        },
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rollupId",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendMessage",
      "discriminator": [
        57,
        40,
        34,
        178,
        189,
        10,
        65,
        26
      ],
      "accounts": [
        {
          "name": "targetRollupPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "target_rollup_pda.rollup_id",
                "account": "rollupPda"
              }
            ]
          }
        },
        {
          "name": "sourceRollupPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "sourceRollupId"
              }
            ]
          }
        },
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sourceRollupId",
          "type": "u8"
        },
        {
          "name": "content",
          "type": "bytes"
        },
        {
          "name": "msgType",
          "type": {
            "defined": {
              "name": "messageType"
            }
          }
        }
      ]
    },
    {
      "name": "updatePrice",
      "discriminator": [
        61,
        34,
        117,
        155,
        75,
        34,
        123,
        208
      ],
      "accounts": [
        {
          "name": "priceFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  105,
                  99,
                  101,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "pair"
              }
            ]
          }
        },
        {
          "name": "sourceRollup",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "rollupId"
              }
            ]
          }
        },
        {
          "name": "updater",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "rollupId",
          "type": "u8"
        },
        {
          "name": "pair",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateRollupMetadata",
      "discriminator": [
        86,
        62,
        147,
        11,
        133,
        81,
        0,
        230
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "rollupPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  108,
                  117,
                  112,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "rollup_pda.rollup_id",
                "account": "rollupPda"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "priceFeed",
      "discriminator": [
        189,
        103,
        252,
        23,
        152,
        35,
        243,
        156
      ]
    },
    {
      "name": "rollupPda",
      "discriminator": [
        58,
        243,
        202,
        175,
        209,
        36,
        170,
        171
      ]
    },
    {
      "name": "rollupRegistry",
      "discriminator": [
        104,
        248,
        208,
        152,
        119,
        74,
        246,
        112
      ]
    },
    {
      "name": "sharedPda",
      "discriminator": [
        243,
        43,
        31,
        7,
        12,
        7,
        185,
        97
      ]
    }
  ],
  "events": [
    {
      "name": "eventBroadcast",
      "discriminator": [
        200,
        148,
        239,
        171,
        57,
        56,
        158,
        52
      ]
    },
    {
      "name": "messageSent",
      "discriminator": [
        116,
        70,
        224,
        76,
        128,
        28,
        110,
        55
      ]
    },
    {
      "name": "priceUpdated",
      "discriminator": [
        154,
        72,
        87,
        150,
        246,
        230,
        23,
        217
      ]
    },
    {
      "name": "rollupRegistered",
      "discriminator": [
        217,
        160,
        182,
        74,
        50,
        105,
        234,
        17
      ]
    },
    {
      "name": "rollupStatusChanged",
      "discriminator": [
        45,
        6,
        195,
        54,
        54,
        126,
        234,
        209
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "contentTooLong",
      "msg": "Content exceeds maximum allowed length"
    },
    {
      "code": 6001,
      "name": "topicTooLong",
      "msg": "Topic exceeds maximum allowed length"
    },
    {
      "code": 6002,
      "name": "nameTooLong",
      "msg": "Name exceeds maximum allowed length"
    },
    {
      "code": 6003,
      "name": "metadataTooLong",
      "msg": "Metadata exceeds maximum allowed length"
    },
    {
      "code": 6004,
      "name": "rollupIdAlreadyExists",
      "msg": "Rollup ID already exists"
    },
    {
      "code": 6005,
      "name": "rollupNotFound",
      "msg": "Rollup not found in registry"
    },
    {
      "code": 6006,
      "name": "cannotSendToSelf",
      "msg": "Cannot send message to self"
    },
    {
      "code": 6007,
      "name": "messageQueueFull",
      "msg": "Message queue is full"
    }
  ],
  "types": [
    {
      "name": "broadcastEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "payload",
            "type": "bytes"
          },
          {
            "name": "sequence",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "eventBroadcast",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "string"
          },
          {
            "name": "sequence",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "message",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "msgType",
            "type": {
              "defined": {
                "name": "messageType"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "content",
            "type": "bytes"
          },
          {
            "name": "sequence",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "messageSent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "sequence",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "messageType",
      "docs": [
        "Data Types"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "stateUpdate"
          },
          {
            "name": "crossRollupMessage"
          },
          {
            "name": "priceUpdate"
          },
          {
            "name": "systemAnnouncement"
          }
        ]
      }
    },
    {
      "name": "priceData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "source",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "priceFeed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pair",
            "type": "string"
          },
          {
            "name": "prices",
            "type": {
              "vec": {
                "defined": {
                  "name": "priceData"
                }
              }
            }
          },
          {
            "name": "lastUpdate",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "priceUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pair",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "source",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rollupInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "pdaAddress",
            "type": "pubkey"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "rollupPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rollupId",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "messages",
            "type": {
              "vec": {
                "defined": {
                  "name": "message"
                }
              }
            }
          },
          {
            "name": "lastProcessedSequence",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rollupRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rollupId",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "pdaAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "rollupRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rollups",
            "type": {
              "vec": {
                "defined": {
                  "name": "rollupInfo"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rollupStatusChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rollupId",
            "type": "u8"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "sharedPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "events",
            "type": {
              "vec": {
                "defined": {
                  "name": "broadcastEvent"
                }
              }
            }
          },
          {
            "name": "lastSequence",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
