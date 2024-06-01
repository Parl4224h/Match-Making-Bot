import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {RateLimiter} from "discord.js-rate-limiter";
import {Button} from "../interfaces/Button";
import discordTokens from "../config/discordTokens";
import {logError} from "../utility/loggers";

export const pingToPlay: Button = {
    data: new ButtonBuilder()
        .setLabel("Toggle Ping to Play")
        .setStyle(ButtonStyle.Primary)
        .setCustomId('p2p-toggle'),
    run: async (interaction) => {
        try{
            const member = await interaction.guild!.members.fetch(interaction.user.id);
            if (member.roles.cache.has(discordTokens.PingToPlayRole)) {
                await member.roles.remove(discordTokens.PingToPlayRole);
                await interaction.reply({ephemeral: true, content: "Ping to Play role removed"});
            } else {
                await member.roles.add(discordTokens.PingToPlayRole);
                await interaction.reply({ephemeral: true, content: "Ping to Play role added"});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'p2p-toggle',
    limiter: new RateLimiter(2, 20000)
}