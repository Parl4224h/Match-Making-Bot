import {Collection, SlashCommandSubcommandBuilder} from "discord.js";
import {SubCommand} from "../../../../interfaces/Command";
import cacheController from "../../../../controllers/CacheController";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";

export const playRates: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("play_rates")
        .setDescription("Show how much each map has been played"),
    run: async (interaction, data) => {
        try {
            await interaction.deferReply();
            const games = await cacheController.getCompletedGames();
            const totals = new Collection<string, number>()
            for (let map of data.getMapManager().getMapNames()) {
                totals.set(map, 0);
            }
            for (let game of games) {
                const check = totals.get(game.map);
                if (check) {
                    totals.set(game.map, check + 1);
                } else {
                    totals.set(game.map, 1);
                }
            }
            let display = "```Number of times each map has been played\n";
            for (let total of totals) {
                display += `${total[0]}: ${total[1]}\n`;
            }
            display += "```";
            await interaction.followUp({content: display});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: "play_rates",
    allowedRoles: discordTokens.Moderators,
}