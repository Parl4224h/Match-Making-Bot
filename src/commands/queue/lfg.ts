import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";

export const lfg: Command = {
    data: new SlashCommandBuilder()
        .setName('lfg')
        .setDescription('See who is in queue'),
    run: async (interaction, data) => {
        try {
            const queue = data.getQueue();
            await interaction.reply({ephemeral: false, content: queue.getQueueStr()});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'lfg',
    allowedChannels: [discordTokens.QueueChannel],
}