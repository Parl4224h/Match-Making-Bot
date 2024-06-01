import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";
import {pingMeExpire, pingMeNumber} from "../../utility/options.util";

export const pingMe: Command = {
    data: new SlashCommandBuilder()
        .setName("ping_me")
        .setDescription("Pings you once a certain number in queue is reached. Expires after 30 minutes")
        .addIntegerOption(pingMeNumber)
        .addIntegerOption(pingMeExpire),
    run: async (interaction, data) => {
        try {
            const time = interaction.options.getInteger('expire_time', true);
            data.getQueue().addPingMe(interaction.user.id, interaction.options.getInteger('in_queue', true), time);
            if (time == 0) {
                await interaction.reply({ephemeral: true, content: `Removed Ping Me`});
            } else {
                await interaction.reply({content: `Added ping me for ${interaction.options.getInteger('in_queue', true)} in queue`})
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'ping_me',
    allowedChannels: [discordTokens.QueueChannel],
}