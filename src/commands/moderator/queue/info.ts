import {SubCommand} from "../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {logError} from "../../../utility/loggers";
import {queueInfoEmbeds} from "../../../embeds/queue.embeds";

export const info: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription('returns info about queue'),
    run: async (interaction, data) => {
        try {
            await interaction.deferReply({ephemeral: true});
            const info = data.getQueue().getInfo();
            await interaction.followUp({ephemeral: true, content: "Queue Info", embeds: queueInfoEmbeds(info)})
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'info',
}