import { Service, ServiceBroker, Context, Span } from "moleculer";
import { cpz } from "../@types";

class TraceLoggerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "trace-logger",
      events: {
        ["trace-logger.spans"]: this.logTrace,
        ["trace-logger.metrics"]: this.logMetric
      }
    });
  }
  logTrace(ctx: Context<Span[]>) {
    if (ctx.params && Array.isArray(ctx.params)) {
      ctx.params.forEach(span => {
        if (!span.name.includes("trace-logger"))
          this.logger.info(span.name, span);
      });
    }
  }

  logMetric(ctx: Context<any[]>) {
    if (ctx.params && Array.isArray(ctx.params)) {
      ctx.params.forEach(metric => {
        this.logger.info(`Metric ${metric.description}`, metric);
      });
    }
  }
}

export = TraceLoggerService;
