import { SubCommand} from "../../../../interfaces/Command";
import {
    calloutOption,
    inPoolOption,
    mapNameOption,
    mapResourceIDOption,
    mapURLOption
} from "../../../../utility/options.util";
import {logError} from "../../../../utility/loggers";
import cacheController from "../../../../controllers/CacheController";
import {MapInt} from "../../../../database/models/MapModel";
import {SlashCommandSubcommandBuilder} from "discord.js";

export const addMap: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName("add_map")
        .setDescription("Add a new map to the database")
        .addStringOption(mapNameOption)
        .addStringOption(mapResourceIDOption)
        .addBooleanOption(inPoolOption)
        .addStringOption(mapURLOption)
        .addStringOption(calloutOption),
    run: async (interaction, data) => {
        try {
            const name = interaction.options.getString('map_name', true);
            const resourceID = interaction.options.getString('resource_id', true);
            const inPool = interaction.options.getBoolean('in_pool', true);
            const imageURL = interaction.options.getString('image_url', true);
            const calloutMap = interaction.options.getString('callout_map', false);
            let map: MapInt;
            if (calloutMap) {
                map = await cacheController.createMap(name, resourceID, inPool, imageURL, calloutMap);
            } else {
                map = await cacheController.createMap(name, resourceID, inPool, imageURL);
            }
            const inPoolString = map.inPool ? "in" : "not in"
            await interaction.reply({ephemeral: true,
                content: `Added map with name of ${map.name}, resourceID of ${map.resourceID}, that is ${inPoolString} pool.`});
            await data.getMapManager().load();
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'add_map',
}