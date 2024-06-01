import {SubCommand} from "../../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {userOption, warnReason} from "../../../../utility/options.util";
import cacheController from "../../../../controllers/CacheController";
import discordTokens from "../../../../config/discordTokens";
import {logError} from "../../../../utility/loggers";


export const warn: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("warn")
        .setDescription("Warns a player")
        .addUserOption(userOption("User to warn"))
        .addStringOption(warnReason),
    run: async (interaction) => {
        try {
            const reason = interaction.options.getString('reason', true);
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            await cacheController.createWarn(dbUser._id, reason, interaction.user.id);
            await interaction.reply({content: `<@${interaction.options.getUser('user', true).id}> has been warned:\n\`\`\`${reason}\`\`\``});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'warn',
    allowedRoles: discordTokens.Moderators
}