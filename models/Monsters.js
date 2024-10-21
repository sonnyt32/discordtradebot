const mongoose = require('mongoose');

// Define the monster schema
const monsterSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the monster
    rarity: { 
        type: String, 
        enum: ['standard', 'uncommon', 'rare', 'legendary'], 
        required: true 
    }, // Rarity of the monster
    value: { type: Number, required: true }, // Value of the monster
    ownerId: { type: String }, // ID of the user who owns the monster
});

// Create the Monster model
const Monster = mongoose.model('Monster', monsterSchema);

// Export the Monster model
module.exports = Monster;
