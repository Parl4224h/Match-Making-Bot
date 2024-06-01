import {SubCommand} from "../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {logError} from "../../../utility/loggers";

export const lock: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('lock')
        .setDescription('locks or unlocks queue'),
    run: async (interaction, data) => {
        try {
            const locked = data.getQueue().toggleLocked();
            if (locked) {
                await interaction.reply({ephemeral: false, content: "The queue is now locked"});
            } else {
                await interaction.reply({ephemeral: false, content: "The queue is no longer locked"});
            }
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'lock',
}