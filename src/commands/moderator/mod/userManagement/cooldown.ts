import {SlashCommandSubcommandBuilder} from "discord.js";
import {cooldownOption, reason, userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import moment from "moment-timezone";
import {Actions} from "../../../../database/models/ActionModel";
import {grammaticalTime} from "../../../../utility/grammatical";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";
import {punishment} from "../../../../utility/punishment.util";

export const cooldown: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("cooldown")
        .setDescription("Cooldown a user based on ban counter")
        .addUserOption(userOption("User to cooldown"))
        .addStringOption(cooldownOption)
        .addStringOption(reason),
    run: async (interaction) => {
        try {
            let user = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            const now = moment().unix();
            const severity = Number(interaction.options.getString("action_type", true)) ?? 0;
            user = await punishment(user, false, severity, now);
            let action;
            if (severity == 0) {
                action = "Minor";
            } else if (severity == 1) {
                action = "Extenuating Major"
            } else {
                action = "Major"
            }
            await cacheController.createActionUser(Actions.Cooldown, interaction.user.id, user.id,interaction.options.getString('reason', true), `Cooldown that scales with ban counter for ${user.banUntil - now} seconds, it was a ${action} action`);
            await interaction.reply({content: `<@${user.id}> has been cooldowned for ${grammaticalTime(user.banUntil - now)}, it was a ${action} action`});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'cooldown',
    allowedRoles: discordTokens.Moderators,
}