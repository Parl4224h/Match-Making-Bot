import {Button} from "../../interfaces/Button";
import {ButtonBuilder, ButtonStyle} from "discord.js";
import {logError} from "../../utility/loggers";

export const lfg: Button = {
    data: new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("In Queue")
        .setCustomId('lfg-queue'),
    run: async (interaction, data) => {
        try {
            const queue = data.getQueue();
            await interaction.reply({ephemeral: true, content: queue.getQueueStr()});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'lfg-queue',
}