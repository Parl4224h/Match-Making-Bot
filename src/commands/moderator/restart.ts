import {Command} from "../../interfaces/Command";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";
import {SlashCommandBuilder} from "@discordjs/builders";

export const restart: Command = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription("Restarts the bot"),
    run: async (interaction) => {
        try {
            await interaction.reply({ephemeral: true, content: 'Restarting bot'});
            process.exit(1);
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'restart',
    allowedRoles: discordTokens.Moderators,
}