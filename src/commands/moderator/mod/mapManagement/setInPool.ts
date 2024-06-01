import {SubCommand} from "../../../../interfaces/Command";
import {inPoolOption, mapSearchOption} from "../../../../utility/options.util";
import {logError} from "../../../../utility/loggers";
import cacheController from "../../../../controllers/CacheController";
import {SlashCommandSubcommandBuilder} from "discord.js";

export const setInPool: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("set_in_pool")
        .setDescription("Set whether a map is in pool or not")
        .addStringOption(mapSearchOption)
        .addBooleanOption(inPoolOption),
    run: async (interaction, data) => {
        try {
            const mapName = interaction.options.getString('map_name', true);
            const mapManager = data.getMapManager();
            const map = mapManager.getMap(mapName);
            if (map) {
                map.inPool = interaction.options.getBoolean('in_pool', true);
                await cacheController.updateMap(map);
                await interaction.reply({ephemeral: true,
                    content: `${mapName} is now ${map.inPool ? "in pool" : "not in pool"}`});
            } else {
                await interaction.reply({ephemeral: true, content: "Map not found"});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'set_in_pool',
    autocomplete: async (interaction, data) => {
        try {
            const focusedValue = interaction.options.getFocused();
            const choices = data.getMapManager().getMapNames();
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue));
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice }))
            );
        } catch (e) {
            await logError(e, interaction);
        }
    }
}