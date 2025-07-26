const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  // JWT authentication plugin
  fastify.register(require("@fastify/jwt"), {
    secret: "supersecretkey", // Use a strong secret key in production
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
