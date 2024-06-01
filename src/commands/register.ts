import {Command} from "../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {SlashCommandStringOption} from "discord.js";
import cacheController from "../controllers/CacheController";
import {logError} from "../utility/loggers";
import discordTokens from "../config/discordTokens";

export const register: Command = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription("Register your steam64ID")
        .addStringOption(new SlashCommandStringOption()
            .setName('id')
            .setDescription("SteamID64")
            .setRequired(true)),
    run: async (interaction) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.user);
            let registered = true;
            if (dbUser.steamID == null) {
                registered = false;
            }
            dbUser.steamID = interaction.options.getString('id', true);
            await cacheController.updateUser(dbUser);
            if (!registered) {
                const member = await interaction.guild!.members.fetch(interaction.user);
                await member.roles.add(discordTokens.PlayerRole);
                await interaction.reply({
                    ephemeral: true,
                    content: `You have registered please go to <#${discordTokens.RegionSelectChannel}> to select your region`
                });
            } else {
                await interaction.reply({ephemeral: true, content: "You have updated your registered id"})
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'register',
}