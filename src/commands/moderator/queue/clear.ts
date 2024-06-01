import {SubCommand} from "../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {logError} from "../../../utility/loggers";

export const clear: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('clear')
        .setDescription('clears queue'),
    run: async (interaction, data) => {
        try {
            data.getQueue().clear();
            await interaction.reply({ephemeral: true, content: 'Queue cleared'});
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'clear',
}