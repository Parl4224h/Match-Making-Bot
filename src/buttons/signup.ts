import {Button} from "../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {logError} from "../utility/loggers";
import discordTokens from "../config/discordTokens";

export const signup: Button = {
    data: new ButtonBuilder()
        .setLabel('Sign Up')
        .setCustomId('sign-up')
        .setStyle(ButtonStyle.Success),
    run: async (interaction) => {
        try {
            const member = await interaction.guild!.members.fetch(interaction.user.id);
            await member.roles.add(discordTokens.PlayerRole)
            await interaction.reply({ephemeral: true,
                //`/register` to add your steam64ID (will be required for custom servers https://www.steamidfinder.com/)
                content: `You have signed up please go to <#${discordTokens.RegionSelectChannel}> to select a region\nGo to <#${discordTokens.QueueChannel}> to ready up or use \`/ready\``});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    id: 'sign-up',
}