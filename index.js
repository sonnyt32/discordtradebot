const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/Users'); 
const Monster = require('./models/Monsters');

// MongoDB connection string
const MONGODB_URI = 'your_mongodb_connection_string'; // Replace with your actual MongoDB connection string
const DISCORD_TOKEN = 'your_discord_bot_token'; // Replace with your actual Discord bot token

// Database connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch(err => console.error('MongoDB connection error:', err));

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Needed to read message content
    ],
});

// Load commands
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// When the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Handle incoming messages
client.on('messageCreate', async message => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check or create user in the database
    let user = await User.findOne({ userId: message.author.id });
    if (!user) {
        user = new User({ userId: message.author.id });
        await user.save();
    }

    // Award 1 coin for each message
    user.balance += 1;
    await user.save();

    // Split the message into command and arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Execute the command if it exists
    if (client.commands.has(commandName)) {
        const command = client.commands.get(commandName);
        command.execute(message, args);
    }
});

// Handle member invites (to award coins)
client.on('guildMemberAdd', async member => {
    const invites = await member.guild.invites.fetch();
    const userInvites = invites.find(invite => invite.uses > 0 && invite.inviter.id === member.id);

    if (userInvites) {
        let user = await User.findOne({ userId: userInvites.inviter.id });
        if (!user) {
            user = new User({ userId: userInvites.inviter.id });
            await user.save();
        }

        // Award 10 coins for the invite
        user.balance += 10;
        await user.save();
    }
});

// Log in to Discord
client.login(DISCORD_TOKEN);
