import {Button} from "../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {matchUnready} from "../../utility/match.util";
import {logError} from "../../utility/loggers";

export const unready: Button = {
    data: new ButtonBuilder()
        .setLabel('Unready')
        .setCustomId('unready-snd')
        .setStyle(ButtonStyle.Danger),
    run: async (interaction, data) => {
        try {
            await matchUnready(interaction, data);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    id: 'unready-snd',
}