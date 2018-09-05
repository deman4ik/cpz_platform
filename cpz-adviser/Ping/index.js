function Ping(context, req) {
  context.log("Pinged.");

  if (req.query || req.body) {
    context.res = {
      body: req.query || req.body
    };
  } else {
    context.res = {
      body: "OK"
    };
  }
}

module.exports = Ping;
