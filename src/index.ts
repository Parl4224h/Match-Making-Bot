import { Client } from "discord.js";
import tokens from './config/tokens';
import {IntentOptions, PartialsOptions} from './config/IntentOptions';
import { onInteraction } from "./events/onInteraction";
import {onReady} from "./events/onReady";
import {Data} from "./data";

(async () => {
    const BOT = new Client({
        intents: IntentOptions,
        partials: PartialsOptions,
    });

    // Create the only instance of the Data class
    const data = new Data(BOT);

    // Add listeners
    BOT.once("ready", async () => await onReady(BOT, data, false));
    BOT.on(
        "interactionCreate",
        async (interaction) => await onInteraction(interaction, data)
    );

    await BOT.login(tokens.BotToken);
})();