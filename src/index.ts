import { Client } from "discord.js";
import tokens from './config/tokens';
import {IntentOptions, PartialsOptions} from './config/IntentOptions';
import { onInteraction } from "./events/onInteraction";
import {onReady} from "./events/onReady";
import {Data} from "./data";
import {MapManager} from "./utility/match.util";
import {onMessage} from "./events/onMessage";
import {onVoiceUpdate} from "./events/onVoiceUpdate";

(async () => {
    const BOT = new Client({
        intents: IntentOptions,
        partials: PartialsOptions,
    });

    // Create the only instance of the Data class
    const data = new Data(BOT, new MapManager());

    // Add listeners
    BOT.once("ready", async () => await onReady(BOT, data, false));
    BOT.on(
        "interactionCreate",
        async (interaction) => await onInteraction(interaction, data)
    );

    BOT.on(
        "messageCreate",
        async (message) => await onMessage(message, data)
    );

    BOT.on(
        'voiceStateUpdate',
    async (oldState, newState) => await onVoiceUpdate(oldState, newState, data)
    )

    await BOT.login(tokens.BotToken);
})();