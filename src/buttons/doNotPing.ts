import {Button} from "../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import discordTokens from "../config/discordTokens";
import {logError} from "../utility/loggers";

export const doNotPing: Button = {
    data: new ButtonBuilder()
        .setLabel("Toggle Do-Not-Ping")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("do-not-ping"),
    run: async (interaction) => {
        try {
            const member = await interaction.guild!.members.fetch(interaction.user.id);
            let hasRole = member.roles.cache.has(discordTokens.DoNotPingRole);
            if (hasRole) {
                await member.roles.remove(discordTokens.DoNotPingRole);
                await interaction.reply({ephemeral:true, content: "Removed Do-Not-Ping role"});
            } else {
                await member.roles.add(discordTokens.DoNotPingRole);
                await interaction.reply({ephemeral:true, content: "Added Do-Not-Ping role"});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: "do-not-ping",
}