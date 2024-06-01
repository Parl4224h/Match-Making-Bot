import {Button} from "../../interfaces/Button";
import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";
import {matchReady} from "../../utility/match.util";
import {readyLimiter} from "../../utility/limiters.util";
import {logError} from "../../utility/loggers";

export const ready15: Button = {
    data: new ButtonBuilder()
        .setLabel('15')
        .setCustomId('ready-button-15')
        .setStyle(ButtonStyle.Success),
    run: async (interaction, data) => {
        try {
            await matchReady(interaction, data, 15);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    id: 'ready-button-15',
    limiter: readyLimiter,
}

export const ready30: Button = {
    data: new ButtonBuilder()
        .setLabel('30')
        .setCustomId('ready-button-30')
        .setStyle(ButtonStyle.Success),
    run: async (interaction, data) => {
        try {
            await matchReady(interaction, data, 30);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    id: 'ready-button-30',
    limiter: readyLimiter,
}

export const ready60: Button = {
    data: new ButtonBuilder()
        .setLabel('60')
        .setCustomId('ready-button-60')
        .setStyle(ButtonStyle.Success),
    run: async (interaction, data) => {
        try {
            await matchReady(interaction, data, 60);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    id: 'ready-button-60',
    limiter: readyLimiter,
}

export const ready120: Button = {
    data: new ButtonBuilder()
        .setLabel('120')
        .setCustomId('ready-button-120')
        .setStyle(ButtonStyle.Success),
    run: async (interaction, data) => {
        try {
            await matchReady(interaction, data, 120);
        } catch (e) {
            await logError(e, interaction)
        }
    },
    id: 'ready-button-120',
    limiter: readyLimiter,
}
