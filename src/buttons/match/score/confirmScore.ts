import {Button} from "../../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import cacheController from "../../../controllers/CacheController";
import {GameController} from "../../../controllers/GameController";
import {logError} from "../../../utility/loggers";

export const confirmScore: Button = {
    data: new ButtonBuilder()
        .setLabel("Confirm Scores")
        .setStyle(ButtonStyle.Success)
        .setCustomId('score-accept'),
    run: async (interaction, data) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.user);
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                const response = await game.acceptScore(dbUser._id);
                await interaction.reply({ephemeral: true, content: response.message});
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'score-accept',
}