const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Unique ID for the user
    balance: { type: Number, default: 0 }, // User's balance
    monsters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Monster' }], // Array of monster IDs owned by the user
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
