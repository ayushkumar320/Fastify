const User = require("../models.user.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.register = async(request, reply) => {
  try {
    // Validate body
    if (!request.body || !request.body.name || !request.body.email || !request.body.password) {
      return reply.status(400).send({
        status: "error",
        message: "Name, email, and password are required"
      });
    }
    
    const {name, email, password, country} = request.body;
    
    // Check the fields
    if (!name || !email || !password) {
      return reply.status(400).send({
        status: "error",
        message: "Name, email, and password are required"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      country
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
      error: error.message
    });
  }
}