import {SlashCommandSubcommandBuilder} from "discord.js";
import {regionOption, userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import discordTokens from "../../../../config/discordTokens";
import {Regions} from "../../../../database/models/UserModel";
import {logError} from "../../../../utility/loggers";

const regionRoleArray = [discordTokens.RegionRoles.NAE, discordTokens.RegionRoles.NAW,
    discordTokens.RegionRoles.EUE, discordTokens.RegionRoles.EUW, discordTokens.RegionRoles.APAC,];

export const setRegion: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("set_region")
        .setDescription("Set's a user's region")
        .addUserOption(userOption("user to set region of"))
        .addStringOption(regionOption),
    run: async (interaction) => {
        try {
            const member = await interaction.guild!.members.fetch(interaction.options.getUser('user', true));
            for (let role of member.roles.cache.keys()) {
                if (regionRoleArray.includes(role)) {
                    await member.roles.remove(role);
                }
            }
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            switch (interaction.options.getString('region', true)) {
                case "NAE": dbUser.region = Regions.NAE; await member.roles.add(discordTokens.RegionRoles.NAE); break;
                case "NAW": dbUser.region = Regions.NAW; await member.roles.add(discordTokens.RegionRoles.NAW); break;
                case "EUE": dbUser.region = Regions.EUE; await member.roles.add(discordTokens.RegionRoles.EUE); break;
                case "EUW": dbUser.region = Regions.EUW; await member.roles.add(discordTokens.RegionRoles.EUW); break;
                case "APAC": dbUser.region = Regions.APAC; await member.roles.add(discordTokens.RegionRoles.APAC); break;
            }
            await cacheController.updateUser(dbUser);
            await interaction.reply({ephemeral: true, content: "updated user's region"});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: "set_region",
    allowedRoles: discordTokens.Moderators,
}