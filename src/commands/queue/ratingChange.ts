import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import cacheController from "../../controllers/CacheController";
import {userOptional} from "../../utility/options.util";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";

export const ratingChange: Command = {
    data: new SlashCommandBuilder()
        .setName('rating_change')
        .setDescription("View rating change for last game played")
        .addUserOption(userOptional("User to view rating change of")),
    run: async (interaction) => {
        try {
            let user = interaction.options.getUser('user');
            let self = false;
            if (!user) {
                self = true;
                user = interaction.user;
            }

            const dbUser = await cacheController.getUserByUser(user);
            let stats = await cacheController.getStatsByUserId(dbUser._id);
            stats = stats!;
            if (stats.gamesPlayed < 11) {
                await interaction.reply({ephemeral: true, content: "This user has not played enough games to use this feature yet"});
            } else {
                if (self) {
                    await interaction.reply({content: `Your rating changed by ${stats.ratingChange.toFixed(1)} last game`});
                } else {
                    await interaction.reply({content: `${user.username}'s rating changed by ${stats.ratingChange.toFixed(1)} last game`});
                }
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'rating_change',
    allowedChannels: [discordTokens.QueueChannel],
}