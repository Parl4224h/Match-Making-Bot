import {Button} from "../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {GameController} from "../../controllers/GameController";
import cacheController from "../../controllers/CacheController";
import {logError} from "../../utility/loggers";

export const autoReady: Button = {
    data: new ButtonBuilder()
        .setLabel("Auto Ready")
        .setStyle(ButtonStyle.Primary)
        .setCustomId('re-ready-button'),
    run: async (interaction, data) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.user);
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                const result = game.toggleRequeue(dbUser._id);
                await interaction.reply({ephemeral: true, content: result.message});
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }

        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 're-ready-button',
}