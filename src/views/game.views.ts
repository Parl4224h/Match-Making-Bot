import {ActionRowBuilder} from "discord.js";
import {accept} from "../buttons/match/accept";
import {MessageActionRowComponentBuilder} from "discord.js";
import {vote1, vote2, vote3, vote4, vote5, vote6, vote7} from "../buttons/match/voteButtons";
import {missing} from "../buttons/match/missing";
import {win} from "../buttons/match/score/win";
import {loss} from "../buttons/match/score/loss";
import {
    score0,
    score1,
    score2,
    score3,
    score4,
    score5,
    score6,
    score7,
    score8,
    score9
} from "../buttons/match/score/score";
import {confirmScore} from "../buttons/match/score/confirmScore";
import {autoReady} from "../buttons/match/autoReady";
import {resetSND} from "../buttons/match/resetSND";
import {switchMap} from "../buttons/match/switchMap";

export const acceptView = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(accept.data, missing.data).toJSON();
}

export const voteA1 = (label1: string, count1: number, label2: string, count2: number, label3: string, count3: number,
                       label4: string, count4: number, label5: string, count5: number, label6: string, count6: number,
                       label7: string, count7: number) => {
    const A = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(vote1.data.setLabel(`${label1}: ${count1}`), vote2.data.setLabel(`${label2}: ${count2}`),
            vote3.data.setLabel(`${label3}: ${count3}`), vote4.data.setLabel(`${label4}: ${count4}`),
            vote5.data.setLabel(`${label5}: ${count5}`)).toJSON();
    const B = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(vote6.data.setLabel(`${label6}: ${count6}`), vote7.data.setLabel(`${label7}: ${count7}`)).toJSON();
    return [A, B];
}

export const voteB1 = (label1: string, count1: number, label2: string, count2: number, label3: string, count3: number,
                       label4: string, count4: number) => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(vote1.data.setLabel(`${label1}: ${count1}`), vote2.data.setLabel(`${label2}: ${count2}`),
            vote3.data.setLabel(`${label3}: ${count3}`), vote4.data.setLabel(`${label4}: ${count4}`)).toJSON();
}

export const voteAB2 = (label1: string, count1: number, label2: string, count2: number) => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(vote1.data.setLabel(`${label1}: ${count1}`), vote2.data.setLabel(`${label2}: ${count2}`)).toJSON();
}

export const initialSubmit = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(win.data, loss.data, autoReady.data).toJSON();
}

export const initialSubmitServer = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(win.data, loss.data, autoReady.data, resetSND.data, switchMap.data).toJSON();
}

export const roundsWon = () => {
    const rowA = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(score0.data, score1.data, score2.data, score3.data, score4.data);

    const rowB = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(score5.data, score6.data, score7.data, score8.data, score9.data);


    return [rowA.toJSON(), rowB.toJSON()];
}

export const acceptScore = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(confirmScore.data).toJSON()
}