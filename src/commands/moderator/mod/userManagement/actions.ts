import {SubCommand} from "../../../../interfaces/Command";
import {SlashCommandBooleanOption, SlashCommandSubcommandBuilder} from "discord.js";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";
import cacheController from "../../../../controllers/CacheController";
import {ActionEmbed, warningEmbed} from "../../../../embeds/user.embeds";
import {userOption} from "../../../../utility/options.util";

export const actions: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("actions")
        .setDescription("Displays actions against a user")
        .addUserOption(userOption("User to view actions for"))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName('hidden')
            .setDescription('if message should be visible')
            .setRequired(false)),
    run: async (interaction) => {
        try {
            const user = interaction.options.getUser("user", true)
            const actions = await cacheController.getActions(user.id);
            const dbUser = await cacheController.getUserByUser(user);
            const warnings = await cacheController.getWarnings(dbUser._id);
            const visible = interaction.options.getBoolean('hidden') ?? false;
            await interaction.reply({ephemeral: visible, content: `Showing actions for ${user.username}`, embeds: [ActionEmbed(actions, dbUser), warningEmbed(user, warnings)]});
        } catch (e) {
            console.error(e);
            await logError(e, interaction);
        }
    },
    name: "actions",
    allowedRoles: discordTokens.Moderators,
}