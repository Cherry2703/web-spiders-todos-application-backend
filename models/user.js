const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    user_id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    role: { type: String, default: "USER" },
});

// Export the User model
module.exports = model("User", userSchema);
