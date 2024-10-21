const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/Uses');
const fs = require('fs');

// Load monster data from JSON file
const monsterData = JSON.parse(fs.readFileSync('./monsters.json', 'utf8'));

const getRandomMonster = (monsters) => {
    const totalWeight = monsters.reduce((sum, monster) => sum + monster.chance, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const monster of monsters) {
        cumulativeWeight += monster.chance;
        if (random < cumulativeWeight) {
            return monster;
        }
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buymonster')
        .setDescription('Buy a random monster from a pack.')
        .addStringOption(option =>
            option.setName('pack')
                .setDescription('Type of pack to buy (common/uncommon)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const packType = interaction.options.getString('pack');
        let cost, monsters = [];

        // Define pack cost and chances
        if (packType === 'common') {
            cost = 5;
            monsters = monsterData.filter(m => m.rarity === 'common').map(m => ({ name: m.name, chance: 50 }));
        } else if (packType === 'uncommon') {
            cost = 15;
            monsters = monsterData.filter(m => m.rarity === 'uncommon').map(m => ({ name: m.name, chance: 25 }));
        } else {
            return interaction.reply({ content: 'Invalid pack type. Use `common` or `uncommon`.', ephemeral: true });
        }

        const user = await User.findOne({ userId: interaction.user.id });

        // Check if the user has enough balance
        if (user.balance < cost) {
            return interaction.reply({ content: 'You do not have enough coins to buy this pack.', ephemeral: true });
        }

        // Deduct cost from user balance
        user.balance -= cost;
        await user.save();

        // Get a random monster based on the pack
        const monsterDataFiltered = monsterData.filter(m => monsters.some(monster => monster.name === m.name && m.stock > 0));
        const randomMonster = getRandomMonster(monsterDataFiltered);

        // Check if the selected monster exists and has stock
        if (!randomMonster || randomMonster.stock <= 0) {
            return interaction.reply({ content: `The selected monster is out of stock!`, ephemeral: true });
        }

        // Decrease the stock of the monster
        randomMonster.stock -= 1;
        await fs.writeFileSync('./monsters.json', JSON.stringify(monsterData));

        // Respond with the monster information
        return interaction.reply({ content: `You received: ${randomMonster.name} (Rarity: ${randomMonster.rarity})!`, ephemeral: true });
    },
};
