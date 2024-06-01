import {SlashCommandSubcommandBuilder} from "discord.js";
import cacheController from "../../../../controllers/CacheController";
import {userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import {warningEmbed} from "../../../../embeds/user.embeds";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const warnings: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('warnings')
        .setDescription("View a user's warnings")
        .addUserOption(userOption("User to view warnings of")),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            const warnings = await cacheController.getWarnings(dbUser._id);
            await interaction.reply({content: "Displaying Warnings", embeds: [warningEmbed(interaction.options.getUser('user', true), warnings)]});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: "warnings",
    allowedRoles: discordTokens.Moderators,
}