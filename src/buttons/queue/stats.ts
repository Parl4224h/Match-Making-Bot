import {Button} from "../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import cacheController from "../../controllers/CacheController";
import {statsEmbed} from "../../embeds/queue.embeds";
import {logError} from "../../utility/loggers";

export const stats: Button = {
    data: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Stats")
        .setCustomId("stats-queue"),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.user);
            const stats = await cacheController.getStatsByUserId(dbUser._id);
            await interaction.reply({ephemeral: true, embeds: [statsEmbed(stats!, dbUser, interaction.user.username, interaction.user.avatarURL()!)]});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: "stats-queue",
}