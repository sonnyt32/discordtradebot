const User = require('../models/Users'); // Import the User model

module.exports = {
    name: 'balance',
    description: 'Check your current coin balance',
    async execute(message) {
        try {
            // Find the user in the database
            const user = await User.findOne({ userId: message.author.id });

            // Check if the user exists
            if (!user) {
                return message.channel.send('User not found. Please register first using the !register command.');
            }

            // Send the user's balance
            message.channel.send(`Your current balance is **${user.balance}** coins.`);
        } catch (error) {
            console.error('Error fetching balance:', error);
            message.channel.send('An error occurred while fetching your balance. Please try again later.');
        }
    },
};
