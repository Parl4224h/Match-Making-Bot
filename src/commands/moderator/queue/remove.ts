import {SubCommand} from "../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {userOption} from "../../../utility/options.util";
import cacheController from "../../../controllers/CacheController";
import {logError} from "../../../utility/loggers";

export const remove: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('removes a user from a queue')
        .addUserOption(userOption('User to remove from queue')),
    run: async (interaction, data) => {
        try {
            const user = interaction.options.getUser('user', true);
            const dbUser = await cacheController.getUserByUser(user);
            await data.getQueue().removeUser(dbUser._id, false);
            await interaction.reply({ephemeral: true, content: `<@${user.id}> Has been removed from queue`});
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'remove',
}