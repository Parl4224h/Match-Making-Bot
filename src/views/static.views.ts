import {ActionRowBuilder, MessageActionRowComponentBuilder} from "discord.js";
import {ready120, ready15, ready30, ready60} from "../buttons/queue/ready";
import {unready} from "../buttons/queue/unready";
import {lfg} from "../buttons/queue/lfg";
import {games} from "../buttons/queue/games";
import {stats} from "../buttons/queue/stats";
import {pingMeButton} from "../buttons/queue/pingMe";
import {pingToPlay} from "../buttons/pingToPlay";
import {doNotPing} from "../buttons/doNotPing";
import {signup} from "../buttons/signup";
import {APAC, EUE, EUW, NAE, NAW} from "../buttons/regionSelect";

export const readyViewOne = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(ready15.data, ready30.data, ready60.data, ready120.data, unready.data).toJSON();
}

export const readyViewTwo = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(lfg.data, games.data, stats.data, pingMeButton.data).toJSON();
}

export const readyViewThree = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(pingToPlay.data, doNotPing.data).toJSON();
}


export const signUpView = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(signup.data, pingToPlay.data, doNotPing.data).toJSON();
}

export const regionSelectView = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(NAE.data, NAW.data, EUE.data, EUW.data, APAC.data).toJSON();
}