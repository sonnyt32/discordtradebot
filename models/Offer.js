const User = require('../models/Users'); // Import the User model
const Monster = require('../models/Monsters'); // Import the Monster model

module.exports = {
    name: 'offer',
    description: 'Offer coins for another player\'s monster',
    async execute(message, args) {
        // Check if the correct arguments are provided
        if (args.length < 3) {
            return message.channel.send('Usage: !offer @Player2 <amount> <monsterId>');
        }

        // Extract the player and offer details
        const player2Mention = message.mentions.users.first();
        const offerAmount = parseInt(args[1]);
        const monsterId = args[2];

        // Check if Player 2 exists
        if (!player2Mention) {
            return message.channel.send('Please mention a valid player to offer to.');
        }

        // Check if the offer amount is a valid number
        if (isNaN(offerAmount) || offerAmount <= 0) {
            return message.channel.send('Please provide a valid amount of coins to offer.');
        }

        // Check if Player 1 has enough balance
        const player1 = await User.findOne({ userId: message.author.id });
        if (!player1 || player1.balance < offerAmount) {
            return message.channel.send('You do not have enough balance to make this offer.');
        }

        // Check if Player 2 owns the specified monster
        const player2 = await User.findOne({ userId: player2Mention.id });
        if (!player2 || !player2.monsters.includes(monsterId)) {
            return message.channel.send('The mentioned player does not own the specified monster.');
        }

        // Create offer object
        const offer = {
            from: message.author.id,
            amount: offerAmount,
            monsterId: monsterId,
        };

        // Send offer to Player 2
        const offerMessage = await message.channel.send(`${player2Mention}, you have received an offer of ${offerAmount} coins for your monster! Type \`!accept ${message.author.id} ${offerAmount} ${monsterId}\` to accept or \`!deny ${message.author.id}\` to deny.`);

        // Optional: Set a timeout for the offer
        setTimeout(() => {
            offerMessage.delete();
        }, 30000); // Offer expires in 30 seconds
    },
};

// Accept Command
module.exports.accept = {
    name: 'accept',
    description: 'Accept a coin offer for your monster',
    async execute(message, args) {
        if (args.length < 3) {
            return message.channel.send('Usage: !accept <Player1Id> <amount> <monsterId>');
        }

        const player1Id = args[0];
        const offerAmount = parseInt(args[1]);
        const monsterId = args[2];

        const player2 = await User.findOne({ userId: message.author.id });
        const player1 = await User.findOne({ userId: player1Id });

        // Validate offer details
        if (!player2 || !player1) {
            return message.channel.send('Invalid players.');
        }

        // Check if Player 2 owns the monster
        if (!player2.monsters.includes(monsterId)) {
            return message.channel.send('You do not own this monster.');
        }

        // Process the offer
        player2.monsters.pull(monsterId); // Remove monster from Player 2's collection
        player1.balance -= offerAmount; // Deduct coins from Player 1
        player2.balance += offerAmount; // Add coins to Player 2
        player2.monsters.push(monsterId); // Add the monster to Player 1's collection

        await player1.save();
        await player2.save();

        message.channel.send(`Transaction successful! ${player1.userId} has purchased your monster for ${offerAmount} coins.`);
    },
};

// Deny Command
module.exports.deny = {
    name: 'deny',
    description: 'Deny a coin offer for your monster',
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send('Usage: !deny <Player1Id>');
        }

        const player1Id = args[0];
        message.channel.send(`You have denied the offer from <@${player1Id}>.`);
    },
};
