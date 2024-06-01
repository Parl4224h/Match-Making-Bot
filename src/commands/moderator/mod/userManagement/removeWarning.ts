import {SlashCommandSubcommandBuilder} from "discord.js";
import {SubCommand} from "../../../../interfaces/Command";
import {warnIdOption} from "../../../../utility/options.util";
import cacheController from "../../../../controllers/CacheController";
import mongoose, {ObjectId} from "mongoose";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const removeWarning: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove_warn')
        .setDescription("Removes a warning from a user")
        .addStringOption(warnIdOption),
    run: async (interaction) => {
        try {
            const id = mongoose.Types.ObjectId.createFromHexString(interaction.options.getString('id', true));
            const warn = await cacheController.getWarning(id as any as ObjectId);
            if (warn) {
                warn.removed = true;
                await cacheController.updateWarn(warn);
                await interaction.reply({content: "Warning has been removed"});
            } else {
                await interaction.reply({ephemeral: true, content: "Could not find warning to remove"})
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'remove_warn',
    allowedRoles: discordTokens.Moderators,
}