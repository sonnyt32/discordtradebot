const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/Users');
const Monster = require('../models/Monsters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewmonsters')
        .setDescription('View your monsters or another user\'s monsters.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose monsters you want to view (leave blank for your own)')
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        // Fetch the user's monsters from the database
        const user = await User.findOne({ userId: targetUser.id }).populate('monsters');

        if (!user || !user.monsters || user.monsters.length === 0) {
            return interaction.reply({ content: `${targetUser.username} has no monsters!`, ephemeral: true });
        }

        // Count the monsters
        const monsterCount = {};
        user.monsters.forEach(monster => {
            monsterCount[monster.name] = (monsterCount[monster.name] || 0) + 1;
        });

        // Build the response
        const response = Object.entries(monsterCount)
            .map(([name, count]) => `${name} x${count}`)
            .join('\n');

        return interaction.reply({ content: `Monsters for ${targetUser.username}:\n${response}`, ephemeral: true });
    },
};
