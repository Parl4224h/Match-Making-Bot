import {SlashCommandSubcommandBuilder, SlashCommandUserOption} from "discord.js";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import {StatsInt} from "../../../../database/models/StatsModel";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const transferUser: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('transfer_user')
        .setDescription("Transfers a user's stats")
        .addUserOption(new SlashCommandUserOption()
            .setName('old_user')
            .setDescription("The User's old account or <@id> if account is no longer in server")
            .setRequired(true))
        .addUserOption(new SlashCommandUserOption()
            .setName('new_user')
            .setDescription("The User's new account")
            .setRequired(true)),
    run: async (interaction) => {
        try {
            await interaction.deferReply({ephemeral: true});
            const oldUser = await cacheController.getUserByUser(interaction.options.getUser('old_user', true));
            const newUser = await cacheController.getUserByUser(interaction.options.getUser('new_user', true));
            const stats = await cacheController.getStatsByUserId(oldUser._id) as StatsInt;

            // Transfer user
            newUser.banCounterAbandon = oldUser.banCounterAbandon;
            newUser.banCounterFail = oldUser.banCounterFail;
            newUser.gamesPlayedSinceReductionAbandon = oldUser.gamesPlayedSinceReductionAbandon;
            newUser.gamesPlayedSinceReductionFail = oldUser.gamesPlayedSinceReductionFail;
            newUser.requeue = oldUser.requeue;
            newUser.frozen = oldUser.frozen;
            newUser.steamID = oldUser.steamID;
            newUser.dmAuto = oldUser.dmAuto;
            newUser.dmQueue = oldUser.dmQueue;
            newUser.dmAuto = oldUser.dmAuto;
            newUser.region = oldUser.region;
            newUser.muteUntil = oldUser.muteUntil;
            await cacheController.updateUser(newUser);
            oldUser.transferred = true;
            await cacheController.updateUser(oldUser);

            // Transfer Stats
            stats.userId = newUser._id;
            await cacheController.updateStats(stats);

            // Transfer warnings
            const warnings = await cacheController.getWarnings(oldUser._id);
            for (let warning of warnings) {
                warning.userId = newUser._id;
                await cacheController.updateWarn(warning);
            }

            // Transfer actions
            const actions = await cacheController.getActions(oldUser.id);
            for (let action of actions) {
                action.userId = newUser.id;
                await cacheController.updateAction(action);
            }

            await interaction.followUp({ephemeral: true, content: `Stats have been transferred from <@${oldUser.id}> to <@${newUser.id}>`})
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'transfer_user',
    allowedRoles: discordTokens.Moderators,
}