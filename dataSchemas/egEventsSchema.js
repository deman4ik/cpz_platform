const baseEventSchema = {
    id: {
        description: "An unique identifier for the event.",
        type: "string",
        empty: false
    },
    topic: {
        description: "The resource path of the event source.",
        type: "string",
        empty: false
    },
    subject: {
        description: "A resource path relative to the topic path.",
        type: "string",
        empty: false
    },
    data: {
        description: "Event data specific to the event type.",
        type: "object",
        empty: false
    },
    eventType: {
        description: "The type of the event that occurred.",
        type: "string",
        empty: false
    },
    eventTime: {
        description: "The time (in UTC) the event was generated.",
        format: "date-time",
        type: "string",
        empty: false
    },
    metadataVersion: {
        description: "The schema version of the event metadata.",
        readOnly: true,
        type: "string",
        empty: false
    },
    dataVersion: {
        description: "The schema version of the data object.",
        type: "string",
        empty: false
    }
};

const tasks = {
    topic: "CPZ-TASKS",
    events: [
        {
            eventType: "CPZ.Tasks.MarketWatcher.Start",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                mode: {
                    description: "Service run mode.",
                    type: "string",
                    values: ["backtest", "emulator", "realtime"]
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean"
                },
                providerType: {
                    description: "Data provider type.",
                    type: "string",
                    values: ["сryptoсompare"]
                },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Stop",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Subscribe",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Unsubsribe",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Started",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Stopped",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id. - 'nameProvider'",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Subscribed",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id. - 'nameProvider'",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.MarketWatcher.Unsubscribed",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Candlebatcher.Start",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                mode: {
                    description: "Service run mode.",
                    type: "string",
                    values: ["backtest", "emulator", "realtime"]
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean"
                },
                providerType: {
                    description: "Data provider type.",
                    type: "string",
                    values: ["cryptocompare", "ccxt"]
                },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false },
                timeframes: {
                    description: "List of timeframes in minutes.",
                    type: "array",
                    items: "number"
                },
                proxy: {
                    description: "Proxy endpoint.",
                    type: "string",
                    optional: true,
                    empty: false
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Candlebatcher.Stop",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Candlebatcher.Update",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean"
                },
                timeframes: {
                    description: "List of timeframes in minutes.",
                    type: "array",
                    items: "number"
                },
                proxy: {
                    description: "Proxy endpoint.",
                    type: "string",
                    optional: true,
                    empty: false
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Candlebatcher.Started",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Candlebatcher.Stopped",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Candlebatcher.Updated",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Adviser.Start",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                robotId: {
                    description: "Robot uniq Id.",
                    type: "string",
                    empty: false
                },
                mode: {
                    description: "Service run mode.",
                    type: "string",
                    values: ["backtest", "emulator", "realtime"]
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean",
                    empty: false
                },
                strategy: {
                    description: "Strategy file name.",
                    type: "string",
                    empty: false
                },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false },
                timeframe: {
                    description: "Timeframe in minutes.",
                    type: "number"
                },
                settings: {
                    description: "Adviser parameters.",
                    type: "object"
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Adviser.Stop",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Adviser.Update",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean"
                },
                settings: {
                    description: "Adviser parameters.",
                    type: "object"
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Adviser.Started",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string"
                        },
                        message: {
                            description: "Error message.",
                            type: "string"
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Adviser.Stopped",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Adviser.Updated",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Trader.Start",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                mode: {
                    description: "Service run mode.",
                    type: "string",
                    values: ["backtest", "emulator", "realtime"]
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean"
                },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false },
                timeframe: {
                    description: "Timeframe in minutes.",
                    type: "number"
                },
                robotId: {
                    description: "Robot uniq Id. - 'AdvisorName'",
                    type: "string",
                    empty: false
                },
                userId: {
                    description: "User uniq Id.",
                    type: "string",
                    empty: false
                },
                settings: {
                    description: "Trader parameters.",
                    type: "object",
                    props: {
                        slippageStep: {
                            description: "Price Slippage Step.",
                            type: "number"
                        },
                        volume: {
                            description: "User trade volume",
                            type: "number"
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Trader.Stop",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                robotId: {
                    description: "Robot id.",
                    type: "string",
                    empty: false
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Trader.Update",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                debug: {
                    description: "Debug mode.",
                    type: "boolean"
                },
                settings: {
                    description: "Trader parameters.",
                    type: "object",
                    props: {
                        slippageStep: {
                            description: "Price Slippage Step.",
                            type: "number"
                        },
                        volume: {
                            description: "User trade volume",
                            type: "number"
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Trader.Started",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                rowKey: {
                    description: "Table storage uniq row key.",
                    type: "string",
                    empty: false
                },
                partitionKey: {
                    description: "Table storage partition key.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Trader.Stopped",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Tasks.Trader.Updated",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                taskId: {
                    description: "Uniq task id.",
                    type: "string",
                    empty: false
                },
                error: {
                    type: "object",
                    description: "Error object if something goes wrong.",
                    props: {
                        code: {
                            description: "Error code.",
                            type: "string",
                            empty: false
                        },
                        message: {
                            description: "Error message.",
                            type: "string",
                            empty: false
                        },
                        detail: {
                            description: "Error detail.",
                            type: "string",
                            optional: true,
                            empty: false
                        }
                    },
                    optional: true
                }
            }
        }
    ]
};

const ticks = {
    topic: "CPZ-TICKS",
    events: [
        {
            eventType: "CPZ.Ticks.NewTick",
            subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
            dataSchema: {
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false },
                side: {
                    description: "Trade side.",
                    type: "string",
                    values: ["buy", "sell"]
                },
                tradeId: {
                    description: "Trade ID.",
                    type: "string",
                    empty: false
                },
                time: { description: "Trade time in seconds.", type: "number" },
                volume: { description: "Trade Volume.", type: "number" },
                price: { description: "Trade Price.", type: "number" }
            }
        }
    ]
};

const candles = {
    topic: "CPZ-CANDLES",
    events: [
        {
            eventType: "CPZ.Candles.NewCandle",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
            dataSchema: {
                candleId: { description: "Uniq Candle Id.", type: "string", empty: false },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false },
                timeframe: {
                    description: "Timeframe in minutes.",
                    type: "number"
                },
                time: { description: "Candle time in seconds.", type: "number" },
                open: { description: "Candle Open Price.", type: "number" },
                close: { description: "Candle Close Price.", type: "number" },
                high: { description: "Candle Highest Price.", type: "number" },
                low: { description: "Trade Lowest Price.", type: "number" },
                volume: { description: "Candle Volume.", type: "number" }
            }
        },
        {
            eventType: "CPZ.Candles.Handled",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
            dataSchema: {
                candleId: { description: "Uniq Candle Id.", type: "string", empty: false },
                service: { description: "Sevice name handeling event", type: "string", values: ["adviser"] },
                successAdvisers: { description: "Success Advisers execution list", type: "array", items: "string" },
                errorAdvisers: {
                    description: "Error Advisers execution list",
                    type: "array",
                    items: {
                        type: "object",
                        props: {
                            taskId: { type: "string", empty: false },
                            error: {
                                type: "object",
                                description: "Error object if something goes wrong.",
                                props: {
                                    code: {
                                        description: "Error code.",
                                        type: "string",
                                        empty: false
                                    },
                                    message: {
                                        description: "Error message.",
                                        type: "string",
                                        empty: false
                                    },
                                    detail: {
                                        description: "Error detail.",
                                        type: "string",
                                        optional: true,
                                        empty: false
                                    }
                                },
                                optional: true
                            }
                        }
                    }
                }
            },
            successPendingAdvisers: { description: "Success queued Advisers list", type: "array", items: "string" },
            errorPendingAdvisers: {
                description: "Error queued Advisers list",
                type: "array",
                items: {
                    type: "object",
                    props: {
                        taskId: { type: "string", empty: false },
                        error: {
                            type: "object",
                            description: "Error object if something goes wrong.",
                            props: {
                                code: {
                                    description: "Error code.",
                                    type: "string",
                                    empty: false
                                },
                                message: {
                                    description: "Error message.",
                                    type: "string",
                                    empty: false
                                },
                                detail: {
                                    description: "Error detail.",
                                    type: "string",
                                    optional: true,
                                    empty: false
                                }
                            },
                            optional: true
                        }
                    }
                }
            }
        }
    ]
};

const signals = {
    topic: "CPZ-SIGNALS",
    events: [
        {
            eventType: "CPZ.Signals.NewSignal",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                signalId: { description: "Uniq Candle Id.", type: "string", empty: false },
                exchange: { description: "Exchange code.", type: "string", empty: false },
                asset: { description: "Base currency.", type: "string", empty: false },
                currency: { description: "Quote currency.", type: "string", empty: false },
                timeframe: {
                    description: "Timeframe in minutes.",
                    type: "number"
                },
                robotId: {
                    description: "Robot uniq Id.",
                    type: "string",
                    empty: false
                },
                adviserId: {
                    description: "Adviser task Id.",
                    type: "string",
                    empty: false
                },
                alertTime: {
                    description: "Signal time in seconds.",
                    type: "number"
                },
                action: {
                    description: "Signal type.",
                    type: "string",
                    values: ["long", "closeLong", "short", "closeShort"]
                },
                qty: {
                    description: "Volume.",
                    type: "number",
                    optional: true
                },
                orderType: {
                    description: "Order type.",
                    type: "string",
                    values: ["stop", "limit", "market"],
                    optional: true
                },
                price: {
                    description: "Price in quote currency.",
                    type: "number"
                },
                priceSource: {
                    description: "Candle field.",
                    type: "string",
                    values: ["open", "close", "high", "low", "stop"]
                },
                positionId: {
                    description: "Uniq position Id",
                    type: "number"
                },
                candle: {
                    description: "Signal from Candle.",
                    type: "object",
                    props: {
                        time: { description: "Candle time in seconds.", type: "number" },
                        open: { description: "Candle Open Price.", type: "number" },
                        close: { description: "Candle Close Price.", type: "number" },
                        high: { description: "Candle Highest Price.", type: "number" },
                        low: { description: "Trade Lowest Price.", type: "number" },
                        volume: { description: "Candle Volume.", type: "number" }
                    },
                    optional: true
                },
                settings: {
                    description: "Trader parameters.",
                    type: "object",
                    props: {
                        slippageStep: {
                            description: "Price Slippage Step.",
                            type: "number"
                        },
                        volume: {
                            description: "User trade volume",
                            type: "number"
                        }
                    },
                    optional: true
                }
            }
        },
        {
            eventType: "CPZ.Signals.Handled",
            subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
            dataSchema: {
                signalId: { description: "Uniq Signal Id.", type: "string", empty: false },
                service: { description: "Sevice name handeling event", type: "string", values: ["trader"] },
                successTraders: { description: "Success Traders execution list", type: "array", items: "string" },
                errorTraders: {
                    description: "Error Traders execution list",
                    type: "array",
                    items: {
                        type: "object",
                        props: {
                            taskId: { type: "string", empty: false },
                            error: {
                                type: "object",
                                description: "Error object if something goes wrong.",
                                props: {
                                    code: {
                                        description: "Error code.",
                                        type: "string",
                                        empty: false
                                    },
                                    message: {
                                        description: "Error message.",
                                        type: "string",
                                        empty: false
                                    },
                                    detail: {
                                        description: "Error detail.",
                                        type: "string",
                                        optional: true,
                                        empty: false
                                    }
                                },
                                optional: true
                            }
                        }
                    }
                }
            }
        }
    ]
};
module.exports = { baseEventSchema, tasks, ticks, candles, signals };
