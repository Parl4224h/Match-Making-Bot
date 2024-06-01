import {ButtonBuilder, ButtonStyle} from "discord.js";
import {Button} from "../../interfaces/Button";
import {logError} from "../../utility/loggers";
import {GameController} from "../../controllers/GameController";

export const missing: Button = {
    data: new ButtonBuilder()
        .setLabel('Missing')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('missing-button'),
    run: async (interaction, data) => {
        try {
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                await interaction.reply({ephemeral: false, content: game.getMissing()});
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'missing-button',
}