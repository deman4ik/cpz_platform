import { Service, ServiceBroker, Context } from "moleculer";
import socketio from "socket.io-client";
import cron from "node-cron";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import dayjs from "../../lib/dayjs";
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
}

export = ExwatcherService;
