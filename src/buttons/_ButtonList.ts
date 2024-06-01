import {Button} from "../interfaces/Button";
import {Collection} from "discord.js";
import {confirmScore} from "./match/score/confirmScore";
import {loss} from "./match/score/loss";
import {score0, score1, score2, score3, score4, score5, score6, score7, score8, score9} from "./match/score/score";
import {win} from "./match/score/win";
import {accept} from "./match/accept";
import {autoReady} from "./match/autoReady";
import {resetSND} from "./match/resetSND";
import {switchMap} from "./match/switchMap";
import {vote1, vote2, vote3, vote4, vote5, vote6, vote7} from "./match/voteButtons";
import {games} from "./queue/games";
import {lfg} from "./queue/lfg";
import {pingMeButton} from "./queue/pingMe";
import {ready120, ready15, ready60} from "./queue/ready";
import {stats} from "./queue/stats";
import {unready} from "./queue/unready";
import {pingToPlay} from "./pingToPlay";
import {APAC, EUE, EUW, NAE, NAW} from "./regionSelect";
import {signup} from "./signup";
import {doNotPing} from "./doNotPing";
import {missing} from "./match/missing";
// Button imports

// List of all buttons
const buttonList: Button[] = [
    confirmScore, loss, score0, score1, score2, score3, score4, score5, score6, score7, score8, score9, win, // score buttons
    accept, autoReady, missing, resetSND, switchMap, vote1, vote2, vote3, vote4, vote5, vote6, vote7, // match buttons
    games, lfg, pingMeButton, ready15, ready15, ready60, ready120, stats, unready, // queue buttons
    doNotPing, pingToPlay, NAE, NAW, EUE, EUW, APAC, signup, // general buttons
];
let ButtonMap: Collection<string, Button> = new Collection<string, Button>();

// Create map of all buttons
for (let button of buttonList) {
    ButtonMap.set(button.id, button);
}

export const ButtonList = ButtonMap;