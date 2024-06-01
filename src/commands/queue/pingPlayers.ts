import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import moment from "moment-timezone";
import {grammaticalTime} from "../../utility/grammatical";
import discordTokens from "../../config/discordTokens";
import {logError} from "../../utility/loggers";

export const pingPlayers: Command = {
    data: new SlashCommandBuilder()
        .setName('ping_players')
        .setDescription('Pings players who have opted in'),
    run: async (interaction, data) => {
        try {
            if (data.getPingToPlay()) {
                await interaction.reply({ephemeral: false, content: `<@&${discordTokens.PingToPlayRole}> players are looking for a match`, allowedMentions: {roles: [discordTokens.PingToPlayRole]}});
            } else {
                await interaction.reply({ephemeral: true, content: `You cannot ping players for another ${grammaticalTime(data.getPingTime() - moment().unix())}`})
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'ping_players',
    allowedChannels: [discordTokens.QueueChannel],
}