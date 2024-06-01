import {ButtonBuilder} from "@discordjs/builders";
import {Button} from "../../interfaces/Button";
import {ButtonStyle} from "discord.js";
import {GameController} from "../../controllers/GameController";
import {logError} from "../../utility/loggers";

export const switchMap: Button = {
    data: new ButtonBuilder()
        .setLabel('Switch Map')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('switch-map'),
    run: async (interaction, data) => {
        try {
            await interaction.deferReply({ephemeral: false});
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                try {
                    const res = await game.switchMap(interaction.user.id);
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
    id: 'switch-map',
}