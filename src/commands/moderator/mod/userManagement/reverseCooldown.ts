import {SlashCommandSubcommandBuilder} from "discord.js";
import {cdType, reason, userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import {Actions} from "../../../../database/models/ActionModel";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const reverseCooldown: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('reverse_cooldown')
        .setDescription('Reverses a cooldown given by a bot')
        .addUserOption(userOption('User to reverse cooldown of'))
        .addStringOption(cdType)
        .addStringOption(reason),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            if (interaction.options.getString('type', true) == 'abandon') {
                dbUser.banCounterAbandon--;
                dbUser.banUntil = 0;
                if (dbUser.banCounterAbandon < 0) {
                    dbUser.banCounterAbandon = 0;
                }
            } else {
                dbUser.banCounterFail--;
                dbUser.banUntil = 0;
                if (dbUser.banCounterFail < 0) {
                    dbUser.banCounterFail = 0;
                }
            }
            await cacheController.updateUser(dbUser);
            await interaction.reply({ephemeral: false, content: `<@${dbUser.id}> cooldown of reversed`});
            await cacheController.createActionUser(Actions.ReverseCooldown, interaction.user.id, dbUser.id, interaction.options.getString('reason', true), 'Bot cooldown reversed');
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'reverse_cooldown',
    allowedRoles: discordTokens.Moderators,
}