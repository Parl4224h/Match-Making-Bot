import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import discordTokens from "../../config/discordTokens";
import {logError} from "../../utility/loggers";

export const games: Command = {
    data: new SlashCommandBuilder()
        .setName("games")
        .setDescription("Displays current games and everyone in them"),
    run: async (interaction, data) => {
        try {
            const queue = data.getQueue();
            const gameEmbeds = queue.getGameData()
            await interaction.reply({content: "Current Games:", embeds: gameEmbeds});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: "games",
    allowedChannels: [discordTokens.QueueChannel]
}