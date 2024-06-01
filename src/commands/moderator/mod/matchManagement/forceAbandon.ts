import {SlashCommandSubcommandBuilder} from "discord.js";
import {reason, userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import {Actions} from "../../../../database/models/ActionModel";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";
import {GameController} from "../../../../controllers/GameController";

export const forceAbandon: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('force_abandon')
        .setDescription('Abandons a user from the match')
        .addUserOption(userOption('User to abandon'))
        .addStringOption(reason),
    run: async (interaction, data) => {
        try {
            const dbUser = await cacheController.getUserByUser(interaction.options.getUser('user', true));
            const gameResponse = data.getGameByUserID(dbUser._id);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                const res = await game.abandon(dbUser.id, true);
                if (res.success) {
                    await cacheController.createAction(Actions.ForceAbandon, interaction.user.id, interaction.options.getString('reason', true), `<@${dbUser.id}> force abandoned from game ${game.matchNumber}`);
                    await interaction.reply({ephemeral: false, content: `<@${dbUser.id}> has been abandoned`});
                } else {
                    await interaction.reply({ephemeral: true, content: res.message});
                }
            } else {
                await interaction.reply({ephemeral: true, content: 'User not in a game'});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'force_abandon',
    allowedRoles: discordTokens.Moderators,
}