import { ServiceSchema, Errors } from "moleculer";

const Auth: ServiceSchema = {
  name: "",
  methods: {
    async authAction(ctx: any) {
      if (
        ctx.meta.user &&
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
          throw new Errors.MoleculerClientError(
            "Invalid role",
            403,
            "ERR_INVALID_ROLE"
          );
      }
    }
  }
};

export = Auth;
