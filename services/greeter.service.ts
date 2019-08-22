import { ServiceSchema } from "moleculer";

const GreeterService: ServiceSchema = {
  name: "greeter",

  /**
   * Service settings
   */
  settings: {
    graphql: {
      type: `type Response {
        name: String!
        status: String!
      }`
    }
  },

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    /**
     * Say a 'Hello'
     *
     * @returns
     */
    hello() {
      return "Hello Moleculer";
    },

    /**
     * Welcome a username
     *
     * @param {String} name - User name
     */
    welcome: {
      params: {
        name: "string"
      },
      graphql: {
        mutation: "hello(name: String!): Response"
      },
      handler(ctx) {
        return { name: ctx.params.name, status: "ok" };
      }
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {},

  /**
   * Service created lifecycle event handler
   */
  created() {}

  /**
   * Service started lifecycle event handler
   */
  // started() {

  // },

  /**
   * Service stopped lifecycle event handler
   */
  // stopped() {

  // },
};

export = GreeterService;
