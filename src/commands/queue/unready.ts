import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import discordTokens from "../../config/discordTokens";
import {matchUnready} from "../../utility/match.util";
import {logError} from "../../utility/loggers";

export const unready: Command = {
    data: new SlashCommandBuilder()
        .setName('unready')
        .setDescription('Allows you to unready from queue'),
    run: async (interaction, data) => {
        try {
            await matchUnready(interaction, data);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'unready',
    allowedChannels: [discordTokens.QueueChannel],
}