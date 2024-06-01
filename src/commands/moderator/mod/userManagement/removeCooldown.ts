import {SlashCommandSubcommandBuilder} from "discord.js";
import {SubCommand} from "../../../../interfaces/Command";
import {reason, userOption} from "../../../../utility/options.util";
import cacheController from "../../../../controllers/CacheController";
import {Actions} from "../../../../database/models/ActionModel";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const removeCooldown: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove_cooldown')
        .setDescription("Removed a cooldown without changing the user's ban counter")
        .addUserOption(userOption('User to remove cooldown of'))
        .addStringOption(reason),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            dbUser.banUntil = 0;
            await cacheController.updateUser(dbUser);
            await interaction.reply({ephemeral: false, content: `<@${dbUser.id}> cooldown removed`});
            await cacheController.createActionUser(Actions.RemoveCooldown, interaction.user.id, dbUser.id, interaction.options.getString('reason', true), 'cooldown removed');
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'remove_cooldown',
    allowedRoles: discordTokens.Moderators,
}