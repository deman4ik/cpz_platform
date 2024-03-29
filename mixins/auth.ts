import { ServiceSchema } from "moleculer";
import { Errors } from "moleculer-web";

const Auth: ServiceSchema = {
  name: "",
  methods: {
    authAction(ctx: any) {
      if (
        ctx.meta &&
        ctx.meta.user &&
        ctx.action &&
        ctx.action.roles &&
        Array.isArray(ctx.action.roles) &&
        ctx.action.roles.length > 0
      ) {
        if (
          !ctx.meta.user.roles ||
          !ctx.meta.user.roles.allowedRoles ||
          !Array.isArray(ctx.meta.user.roles.allowedRoles) ||
          !ctx.action.roles.some((r: string) =>
            ctx.meta.user.roles.allowedRoles.includes(r)
          )
        )
          throw new Errors.ForbiddenError("Invalid role", {
            ...ctx.meta.user
          });
      }
    }
  }
};

export = Auth;
