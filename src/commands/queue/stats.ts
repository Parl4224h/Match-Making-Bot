import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {userOptional} from "../../utility/options.util";
import cacheController from "../../controllers/CacheController";
import {statsEmbed} from "../../embeds/queue.embeds";
import discordTokens from "../../config/discordTokens";
import {logError} from "../../utility/loggers";

export const stats: Command = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays a users stats')
        .addUserOption(userOptional('User to display stats of')),
    run: async (interaction) => {
        try {
            let user = interaction.options.getUser('user');
            if (!user) {
                user = interaction.user;
            }
            const dbUser = await cacheController.getUserByUser(user);
            // const queueId = interaction.options.getString('queue', true)
            const queueId = "SND";
            // @ts-ignore
            if (queueId != "ALL") {
                const stats = await cacheController.getStatsByUserId(dbUser._id);
                await interaction.reply({ephemeral: false, embeds: [statsEmbed(stats!, dbUser, user.username, user.avatarURL()!)]});
            } else {
                await interaction.reply({ephemeral: true, content: 'getting stats for all is not currently supported'});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'stats',
    allowedChannels: [discordTokens.QueueChannel],
}