import {SubCommand} from "../../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {timeOption, timeScales, userOption} from "../../../../utility/options.util";
import cacheController from "../../../../controllers/CacheController";
import moment from "moment-timezone";
import discordTokens from "../../../../config/discordTokens";
import {grammaticalTime} from "../../../../utility/grammatical";
import {logError} from "../../../../utility/loggers";


export const mute: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('mute')
        .setDescription("Mutes a player for a set amount of time or infinite if less than 0")
        .addUserOption(userOption("User to mute"))
        .addStringOption(timeScales)
        .addNumberOption(timeOption),
    run: async (interaction) => {
        try {
            let multiplier: number = 0;
            switch (interaction.options.getString('time_scale', true)) {
                case 'm': {multiplier = 60} break;
                case 'h': {multiplier = 60 * 60} break;
                case 'd': {multiplier = 60 * 60 * 24} break;
                case 'w': {multiplier = 60 * 60 * 24 * 7} break;
            }
            const time = interaction.options.getNumber('time', true);
            const user = interaction.options.getUser('user', true);
            const dbUser = await cacheController.getUserByUser(user);
            const member = await interaction.guild!.members.fetch(user.id);
            if (time < 0) {
                dbUser.muteUntil = -1;
                await cacheController.updateUser(dbUser);
                await member.roles.add(discordTokens.MutedRole);
                await interaction.reply({ephemeral: true, content: `<@${user.id}> has been muted indefinitely`});
            } else if (time == 0) {
                dbUser.muteUntil = moment().unix() + time * multiplier;
                await cacheController.updateUser(dbUser);
                await member.roles.remove(discordTokens.MutedRole);
                await interaction.reply({ephemeral: true, content: `<@${user.id}> has been un-muted`});
            } else {
                dbUser.muteUntil = moment().unix() + time * multiplier;
                await cacheController.updateUser(dbUser);
                await member.roles.add(discordTokens.MutedRole);
                await interaction.reply({ephemeral: true, content: `<@${user.id}> has been muted for ${grammaticalTime(time * multiplier)}`});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'mute',
    allowedRoles: discordTokens.Moderators,
}