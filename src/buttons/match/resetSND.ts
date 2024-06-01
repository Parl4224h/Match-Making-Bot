import {Button} from "../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {GameController} from "../../controllers/GameController";
import {logError} from "../../utility/loggers";

export const resetSND: Button = {
    data: new ButtonBuilder()
        .setLabel("Start Game")
        .setStyle(ButtonStyle.Danger)
        .setCustomId('reset-snd-button'),
    run: async (interaction, data) => {
        try {
            await interaction.deferReply({ephemeral: false});
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                try {
                    const res = await game.resetSND(interaction.user.id);
                    await interaction.followUp({ephemeral: true, content: res.message});
                } catch (error ) {
                    await logError(error, interaction);
                    await interaction.followUp({ephemeral: true, content: "Failed to resetSND"});
                }
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'reset-snd-button',
}