import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {games, userOptional} from "../../utility/options.util";
import cacheController from "../../controllers/CacheController";
import {getMMRGraph} from "../../utility/graph.util";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";
export const graph: Command = {
    data: new SlashCommandBuilder()
        .setName('graph')
        .setDescription("Get rank graph")
        .addIntegerOption(games)
        .addUserOption(userOptional("User to get graph of")),
    run: async (interaction) => {
        try {
            let user = interaction.options.getUser('user');
            if (!user) {
                user = interaction.user;
            }
            let dbUser = await cacheController.getUserByUser(user);
            let stats = await cacheController.getStatsByUserId(dbUser._id);
            stats = stats!;
            let gameNumber = interaction.options.getInteger('games');
            if (!gameNumber) {
                gameNumber = stats.gamesPlayed - 10;
            }
            const start = stats.gamesPlayed - gameNumber;
            if (stats.gamesPlayed < 15) {
                await interaction.reply({
                    ephemeral: true,
                    content: "A user must play 15 games before they can be graphed"
                })
            } else if (start < 5) {
                await interaction.reply({
                    ephemeral: true,
                    content: `You are trying to graph more games than the user has played the largest number you can enter is ${stats.gamesPlayed - 5}`
                });
            } else {
                await interaction.reply({
                    content: "Displaying Graph",
                    files: [await getMMRGraph(stats.mmrHistory, start, stats.gamesPlayed, user.username)]
                });
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'graph',
    allowedRoles: [discordTokens.PlayerRole],
    allowedChannels: [discordTokens.QueueChannel],
}