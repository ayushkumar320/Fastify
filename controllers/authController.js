const User = require("../models.user.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.register = async (request, reply) => {
  try {
    // Validate body
    if (
      !request.body ||
      !request.body.name ||
      !request.body.email ||
      !request.body.password
    ) {
      return reply.status(400).send({
        status: "error",
        message: "Name, email, and password are required",
      });
    }

    const {name, email, password, country} = request.body;

    // Check the fields
    if (!name || !email || !password) {
      return reply.status(400).send({
        status: "error",
        message: "Name, email, and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      country,
    });

    // Save the user to the database
    await user.save();

    reply.status(201).send({
      message: "User registered successfully",
    });
  } catch (error) {
    reply.send({
      status: "error",
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.login(async (request, reply) => {
  try {
    // Validate body
    if (!request.body || !request.body.email || !request.body.password) {
      return reply.status(400).send({
        status: "error",
        message: "Email and password are required",
      });
    }

    const {email, password} = request.body;

    // Find the user by email
    const user = await User.findOne({email});

    if (!user) {
      return reply.status(401).send({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return reply.status(401).send({
        status: "error",
        message: "Invalid email or password",
      });
    }
    
    const token = request.server.jwt.sign({id: user._id});

    reply.send({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
      },
    });
  } catch (error) {
    reply.send({
      status: "error",
      message: "Login failed",
      error: error.message,
    });
  }
});


exports.forgotPassword = async (request, reply) => {
  try {
    // Validate body
    if (!request.body || !request.body.email) {
      return reply.status(400).send({
        status: "error",
        message: "Email is required",
      });
    }

    const {email} = request.body;

    // Find the user by email
    const user = await User.findOne({email});

    if (!user) {
      return reply.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`;

    // Here you would send the reset token to the user's email
    // For simplicity, we will just return it in the response
    reply.send({
      status: "success",
      message: "Reset token generated",
      resetToken,
    });
  } catch (error) {
    reply.send({
      status: "error",
      message: "Forgot password failed",
      error: error.message,
    });
  }
}

exports.resetPassword = async (request, reply) => {
  const resetToken = request.params.token;
  const {newPassword} = request.body;

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpiry: {$gt: Date.now()}
  });
  if (!user) {
    return reply.status(400).send({
      status: "error",
      message: "Invalid or expired reset token",
    });
  }
  // hash the password and save it
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  reply.send({
    status: "success",
    message: "Password reset successfully",
  });
};


exports.logout = async (request, reply) => {
  try {
    // Invalidate the token by not returning it
    reply.send({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    reply.send({
      status: "error",
      message: "Logout failed",
      error: error.message,
    });
  }
}
