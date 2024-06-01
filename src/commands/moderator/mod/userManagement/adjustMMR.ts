import {SlashCommandSubcommandBuilder} from "discord.js";
import {mmrOption, userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import {StatsInt} from "../../../../database/models/StatsModel";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const adjustMMR: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('adjust_mmr')
        .setDescription("Adjusts a user's mmr")
        .addUserOption(userOption("User to adjust mmr of"))
        .addNumberOption(mmrOption),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            let stats = await cacheController.getStatsByUserId(dbUser._id) as StatsInt;
            const diff = interaction.options.getNumber('mmr', true);
            for (let mmr of stats.mmrHistory) {
                mmr += diff;
            }
            stats.mmr += diff;
            stats = await cacheController.updateStats(stats);
            await interaction.reply({ephemeral: true, content: `<@${dbUser.id}>'s mmr has been adjusted to ${stats.mmr} (change of ${diff})`});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'adjust_mmr',
    allowedRoles: discordTokens.Moderators,
}