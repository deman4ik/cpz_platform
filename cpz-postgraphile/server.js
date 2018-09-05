const dev = process.env.NODE_ENV !== "production";
if (dev) require("dotenv-safe").config(); // eslint-disable-line
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const basicAuth = require("express-basic-auth");
const { postgraphile } = require("postgraphile");
const PostGraphileConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");

// Список системных пользователей для базовой аутентификации
const users = {};
users[process.env.API_USER] = process.env.API_SECRET;

const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());
if (!dev)
  app.use(
    basicAuth({
      users
    })
  );
app.use(
  postgraphile(process.env.CUSTOMCONNSTR_POSTGRESQL, "cpz-platform", {
    appendPlugins: [PostGraphileConnectionFilterPlugin],
    disableDefaultMutations: true
  })
);

app.listen(process.env.NODE_PORT || process.env.PORT || 80, err => {
  if (err) throw err;
  console.log(
    `> Ready on http://localhost:${process.env.NODE_PORT ||
      process.env.PORT ||
      80}/graphql`
  );
});
