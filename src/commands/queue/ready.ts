import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {matchReady} from "../../utility/match.util";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";

export const ready: Command = {
    data: new SlashCommandBuilder()
        .setName("ready")
        .setDescription("Ready a game")
        .addIntegerOption(option => option
            .setName('time')
            .setDescription('Time to ready up for')
            .setRequired(false)
        ),
    run: async (interaction, data) => {
        try {
            let time = interaction.options.getInteger('time', false);
            if (time) {
                time = Math.max(Math.min(time, 120), 5)
            } else {
                time = 30;
            }
            await matchReady(interaction, data, time);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'ready',
    allowedChannels: [discordTokens.QueueChannel],
}