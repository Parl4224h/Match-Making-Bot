import {Button} from "../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {logError} from "../../utility/loggers";

export const games: Button = {
    data: new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("Current Games")
        .setCustomId('games-queue'),
    run: async (interaction, data) => {
        try {
            const queue = data.getQueue();
            const gameEmbeds = queue.getGameData()
            await interaction.reply({ephemeral: true, content: "Current Games:", embeds: gameEmbeds});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'games-queue',
}