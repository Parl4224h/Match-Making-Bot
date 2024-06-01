import {SlashCommandSubcommandBuilder} from "discord.js";
import {SubCommand} from "../../../../interfaces/Command";
import {userOption} from "../../../../utility/options.util";
import cacheController from "../../../../controllers/CacheController";
import discordTokens from "../../../../config/discordTokens";
import {logError} from "../../../../utility/loggers";

export const freeze: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('freeze')
        .setDescription("Freezes a user")
        .addUserOption(userOption("User to freeze")),
    run: async (interaction, data) => {
        try {
            if (interaction.channel!.isThread()) {
                await interaction.reply({ephemeral: true, content: "This command cannot be used in a thread please use it in the ticket itself"})
            } else {
                const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
                const guild = await interaction.client.guilds.fetch(discordTokens.GuildID);
                const member = await guild.members.fetch(dbUser.id);
                dbUser.frozen = !dbUser.frozen;
                await cacheController.updateUser(dbUser);
                if (dbUser.frozen) {
                    await member.roles.add(discordTokens.MutedRole);
                    await data.getQueue().removeUser(dbUser._id, false);
                    await interaction.reply({ephemeral: false, content: `<@${dbUser.id}> has been frozen`});
                } else {
                    await member.roles.remove(discordTokens.MutedRole);
                    await interaction.reply({ephemeral: false, content: `<@${dbUser.id}> has been unfrozen`});
                }
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'freeze',
    allowedRoles: discordTokens.Moderators,
}