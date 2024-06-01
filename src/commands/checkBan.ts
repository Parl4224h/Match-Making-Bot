import {Command} from "../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import moment from "moment/moment";
import cacheController from "../controllers/CacheController";
import {logError} from "../utility/loggers";

export const checkBan: Command = {
    data: new SlashCommandBuilder()
        .setName('check_ban')
        .setDescription("Checks your current ban counter, cd, and ability to queue"),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.user);
            let cd;
            if (moment().unix() > dbUser.banUntil) {
                cd = `<@${dbUser.id}>\nNo current cooldown, Last cooldown was <t:${dbUser.lastBan}:R>\nBan Counter for Abandon: ${dbUser.banCounterAbandon}\n`;
                cd += `Ban Counter for fail to accept: ${dbUser.banCounterFail}`;
            } else {
                cd = `<@${dbUser.id}>\nCooldown ends <t:${dbUser.banUntil}:R>\nBan Counter: ${dbUser.banCounterAbandon}\n`;
                cd += `Ban Counter for fail to accept: ${dbUser.banCounterFail}`;
            }
            cd += `\nConsecutive games for Abandons: ${dbUser.gamesPlayedSinceReductionAbandon}, Next reduction by time: <t:${dbUser.lastReductionAbandon + 1209600}:F>`
            cd += `\nConsecutive games for Fail to Accept: ${dbUser.gamesPlayedSinceReductionFail}, Next reduction by time: <t:${dbUser.lastReductionFail + 1209600}:F>`
            if (dbUser.frozen == null) {
                dbUser.frozen = false;
                await cacheController.updateUser(dbUser);
            }
            if (dbUser.frozen) {
                cd += "\nYou are frozen from queueing due to a pending ticket";
            }
            await interaction.reply({ephemeral: true, content: cd})
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: "check_ban"
}