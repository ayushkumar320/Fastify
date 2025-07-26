const authController = require('../controllers/authController.js');

module.exports = async function (fastify, opts) {
  // Register route
  fastify.post('/register', authController.register);

  // Login route
  fastify.post('/login', authController.login);

  // Password reset request route
  fastify.post('/reset-password', authController.requestPasswordReset);

  // Password reset route
  fastify.post('/reset-password/:token', authController.resetPassword);

  // Logout route
  fastify.post(
    '/logout', 
    {
      preHandler: [fastify.authenticate], // Ensure user is authenticated
    },
    authController.logout
  );
}