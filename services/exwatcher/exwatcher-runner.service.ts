import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../@types";
import Auth from "../../mixins/auth";

class ExwatcherService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.EXWATCHER_RUNNER,
      mixins: [Auth],
      dependencies: [cpz.Service.DB_EXWATCHERS],
      settings: {
        graphql: {
          type: `
        input Market {
          exchange: String!
          asset: String!
          currency: String!
        }
        `
        }
      },
      actions: {
        subscribe: {
          params: {
            subscriptions: {
              type: "array",
              items: {
                type: "object",
                props: {
                  exchange: "string",
                  asset: "string",
                  currency: "string"
                }
              }
            }
          },
          graphql: {
            mutation: "exwatcherSubscribe(subscriptions: [Market!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          handler: this.subscribe
        },
        unsubscribe: {
          params: {
            subscriptions: {
              type: "array",
              items: {
                type: "object",
                props: {
                  exchange: "string",
                  asset: "string",
                  currency: "string"
                }
              }
            }
          },
          graphql: {
            mutation:
              "exwatcherUnsubscribe(subscriptions: [Market!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          handler: this.unsubscribe
        },
        unsubscribeall: {
          params: {
            exchanges: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          graphql: {
            mutation:
              "exwatcherUnsubscribeAll(exchanges: [String!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          handler: this.unsubscribeall
        }
      }
    });
  }

  async subscribe(
    ctx: Context<{
      subscriptions: {
        exchange: string;
        asset: string;
        currency: string;
      }[];
    }>
  ): Promise<{
    success: boolean;
    result?:
      | {
          exchange: string;
          asset: string;
          currency: string;
          success: boolean;
          error?: string;
        }
      | {
          exchange: string;
          asset: string;
          currency: string;
          success: boolean;
          error?: string;
        }[];
    error?: string;
  }> {
    try {
      const result = await this.broker.mcall<{
        exchange: string;
        asset: string;
        currency: string;
        success: boolean;
        error?: string;
      }>(
        ctx.params.subscriptions.map(sub => ({
          action: `${sub.exchange}-watcher.subscribe`,
          params: {
            asset: sub.asset,
            currency: sub.currency
          }
        }))
      );
      return { success: true, result };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e.message
      };
    }
  }

  async unsubscribe(
    ctx: Context<{
      subscriptions: {
        exchange: string;
        asset: string;
        currency: string;
      }[];
    }>
  ): Promise<{
    success: boolean;
    result?:
      | {
          exchange: string;
          asset: string;
          currency: string;
          success: boolean;
          error?: string;
        }
      | {
          exchange: string;
          asset: string;
          currency: string;
          success: boolean;
          error?: string;
        }[];
    error?: string;
  }> {
    try {
      const result = await this.broker.mcall<{
        exchange: string;
        asset: string;
        currency: string;
        success: boolean;
        error?: string;
      }>(
        ctx.params.subscriptions.map(sub => ({
          action: `${sub.exchange}-watcher.unsubscribe`,
          params: {
            asset: sub.asset,
            currency: sub.currency
          }
        }))
      );
      return { success: true, result };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e.message
      };
    }
  }

  async unsubscribeall(
    ctx: Context<{
      exchanges: string[];
    }>
  ): Promise<{
    success: boolean;
    result?:
      | {
          success: boolean;
          error?: string;
        }
      | {
          success: boolean;
          error?: string;
        }[];
    error?: string;
  }> {
    try {
      const result = await this.broker.mcall<{
        exchange: string;
        asset: string;
        currency: string;
        success: boolean;
        error?: string;
      }>(
        ctx.params.exchanges.map(exchange => ({
          action: `${exchange}-watcher.unsubscribeall`,
          params: {}
        }))
      );
      return { success: true, result };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e.message
      };
    }
  }
}

export = ExwatcherService;
