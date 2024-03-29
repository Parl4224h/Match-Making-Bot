import {Button} from "../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {logError} from "../utility/loggers";
import {getUserByUser} from "../modules/getters/getUser";
import {acceptLimiter} from "../utility/limiters";

export const accept: Button = {
    data: new ButtonBuilder()
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success)
        .setCustomId('match-accept'),
    run: async (interaction, data) => {
        try {
            console.log("");
            // TODO: add accept logic
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'match-accept',
    limiter: acceptLimiter,
}