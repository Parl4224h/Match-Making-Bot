import GameStage from "../stages/GameStage";
import {AcceptStage} from "../stages/game/accept.stage";
import {Client, Guild, TextChannel} from "discord.js";
import {Data} from "../data";
import {GameData, GameUser, InternalResponse} from "../interfaces/Internal";
import {BanThreeStage} from "../stages/game/banThree.stage";
import {VoteData} from "../utility/vote.util";
import {mapIndex} from "../interfaces/Game";
import {FinalData, getPreviousVotes, logScoreSubmit, sendAbandonMessage} from "../utility/match.util";
import {BanTwoStage} from "../stages/game/banTwo.stage";
import {SelectMapStage} from "../stages/game/selectMap.stage";
import {SelectSideStage} from "../stages/game/selectSide.stage";
import {ObjectId} from "mongoose";
import {UserInt} from "../database/models/UserModel";
import {GameServer} from "../utility/server.util";
import tokens from "../config/tokens";
import {acceptScore} from "../views/game.views";
import {matchConfirmEmbed, matchFinalEmbed} from "../embeds/game.embeds";
import cacheController from "./CacheController";
import moment from "moment-timezone";
import {processMMR} from "../utility/mmr.util";
import {updateRanks} from "../utility/rank.util";
import {punishment} from "../utility/punishment.util";
import {logWarn} from "../utility/loggers";
import {FinalStage} from "../stages/game/final.stage";
import discordTokens from "../config/discordTokens";

export enum Stages {
    accept = 0,
    vote = 1,
    final = 2,
    scoreConfirm = 3,
    processing = 4,
    processed = 5,
}

export class GameController {
    public readonly data: Data;
    public readonly client: Client;
    public readonly matchNumber: number;
    public readonly guild: Guild;
    public readonly startTime: number;
    public readonly finalGenTime: number = -1;
    public readonly region: string;

    private readonly server: GameServer | null;

    // Variables for stage handling
    private currentStage: GameStage;
    private firstTick: boolean;
    private stage: Stages = Stages.accept;
    private state = 0
    private acceptStage: AcceptStage = new AcceptStage(this);
    private votingStages: GameStage[] = [new BanThreeStage(this), new BanTwoStage(this), new SelectMapStage(this), new SelectSideStage(this)];
    private finalStage: GameStage = new FinalStage(this);
    // 0 is team a 1 is team b
    private votingTeam: 0 | 1 = 0;
    private tickCount = 0;

    // Variables for match handling
    private abandoned = false;
    private nullified = false;
    private gameEndCountdown = 30;
    private readonly users: GameUser[] = [];
    private readonly voteData: VoteData;
    public readonly finalData: FinalData;
    private processed = false;
    private channels: string[] = [];
    private map: string = "Map not yet chosen";
    private sides: [string, string] = ['Not yet chosen', 'Not yet chosen'];
    private scores: [number, number] = [-1, -1];
    private scoresAccepted: [boolean, boolean] = [false, false];
    private requeueArray: ObjectId[] = [];
    private submitCooldown = tokens.SubmitCooldown;
    private scoreConfirmSent = false;
    private gameEnded = false;

    constructor(data: Data, client: Client, guild: Guild, matchNumber: number, bannedMaps: string[], startTime: number, region: string, server: GameServer | null, users: GameUser[], firstTick: boolean = true) {
        this.data = data;
        this.client = client;
        this.guild = guild;
        this.matchNumber = matchNumber;
        this.currentStage = this.acceptStage;
        this.firstTick = firstTick;
        this.voteData = {
            sideSet: {
                "1": "CT",
                "2": "T",
            },
            bannedMaps: bannedMaps,
            teamAChannelID: "",
            teamBChannelID: "",
            teamARoleID: "",
            teamBRoleID: "",
            teamAVCID: "",
            teamBVCID: "",
        }
        this.finalData = {
            channelID: "",
        }
        this.startTime = startTime;
        this.server = server;
        this.region = region;
        this.users = users;
    }

    public async next() {
        if (this.stage == Stages.accept) {
            this.state = 0;
            this.currentStage = this.votingStages[this.state];
            this.stage = Stages.vote;
        } else if (this.stage == Stages.vote) {
            if (this.state < this.votingStages.length - 1) {
                this.state++;
                this.currentStage = this.votingStages[this.state];
            } else {
                this.state = 0;
                this.currentStage = this.finalStage;
                this.stage = Stages.final;
            }
        } else if (this.stage == Stages.final) {
            this.stage = Stages.scoreConfirm;
        } else if (this.stage == Stages.scoreConfirm) {
            this.stage = Stages.processing;
        } else {
            this.stage = Stages.processed;
        }
        this.firstTick = true;
    }

    public async tick() {
        this.tickCount++;
        // Whether to clean-up last stage
        let cleanup = false;
        // Transfer first tick var to local in loop in case the other tasks take longer than 1 second
        if (this.firstTick) {
            this.firstTick = false;
            cleanup = true;
            await this.currentStage.start();
        }
        if (this.abandoned || this.nullified) {
            this.gameEndCountdown--;
        }
        if (!this.gameEnded && this.gameEndCountdown <= 0) {
            console.log("here1")
            this.gameEnded = true;
            if (this.stage == Stages.accept) {
                await this.acceptStage.gameEnd();
            } else if (this.stage == Stages.vote) {
                await this.acceptStage.gameEnd();
                await this.votingStages[this.votingStages.length - 1]!.gameEnd();
            } else {
                console.log("here2")
                await this.acceptStage.gameEnd();
                await this.votingStages[this.votingStages.length - 1]!.gameEnd();
                await this.finalStage.gameEnd();
            }
        }

        if (this.stage != Stages.scoreConfirm && this.stage != Stages.processing) {
            await this.currentStage.tick();
        } else if (this.stage == Stages.scoreConfirm) {
            if (!this.scoreConfirmSent) {
                this.scoreConfirmSent = true;
                const channel = await this.guild.channels.fetch(this.finalData.channelID) as TextChannel;
                await channel.send({components: [acceptScore()], embeds: [matchConfirmEmbed(this.scores)]});
            } else if (this.scoresAccepted[0] && this.scoresAccepted[1]) {
                await this.next();
            }
        } else if (this.stage == Stages.processing) {
            await this.next();
            await this.process();
        }

        if (this.stage == Stages.final) {
            this.submitCooldown--;
        }

        // Do the cleanup of previous stage
        if (cleanup) {
            if (this.stage == Stages.vote && this.state == 0) {
                await this.acceptStage.cleanup();
            } else if (this.stage == Stages.vote) {
                await this.votingStages[this.state - 1].cleanup();
            } else if (this.stage == Stages.final) {
                await this.votingStages[this.votingStages.length - 1].cleanup();
            } else if (this.stage == Stages.scoreConfirm) {
                await this.finalStage.cleanup();
            }
        }
    }

    private async process() {
        try {
            const channel = await this.guild.channels.fetch(this.finalData.channelID) as TextChannel;
            await channel.send({content: "Scores have been accepted"});

            let game = await cacheController.getGameByMatchNumber(this.matchNumber);
            game = game!;
            game.map = this.map;
            game.scoreA = this.scores[0];
            game.scoreB = this.scores[1];
            game.endDate = moment().unix();
            if (game.scoreA == 10) {
                game.winner = 0;
            } else if (game.scoreB == 10) {
                game.winner = 1;
            } else {
                game.winner = -1;
            }
            const changes = await processMMR(this.users, this.scores, tokens.ScoreLimit);
            game.teamAChanges = changes[0];
            game.teamBChanges = changes[1];

            game = await cacheController.updateGame(game);

            for (let user of this.users) {
                let dbUser = await cacheController.getUserById(user.dbID);
                dbUser = dbUser!;
                dbUser.gamesPlayedSinceReductionAbandon++;
                dbUser.gamesPlayedSinceReductionFail++;
                await cacheController.updateUser(dbUser);
            }

            await updateRanks(this.users, this.client);

            const scoreChannel = await this.client.channels.fetch(discordTokens.ScoreChannel) as TextChannel;
            await scoreChannel.send({content: `Match ${this.matchNumber}`, embeds: [matchFinalEmbed(game, this.users, this.data.getMapManager())]});

            this.gameEndCountdown = 0;
            this.processed = true;
        } catch (error) {
            console.error(error);
        }
    }

    public async abandon(userID: string, forced: boolean): Promise<InternalResponse> {
        let user: GameUser | null = null;
        for (let userCheck of this.users) {
            if (userCheck.discordMember.id == userID) {
                user = userCheck;
            }
        }
        if (!user) {
            return {success: false, message: 'Could not find user in game' };
        }
        if (this.server && !forced) {
            try {
                const serverInfo = await this.server.serverInfo()
                try {
                    if (Number(serverInfo.ServerInfo.Team0Score) >= 6 || Number(serverInfo.ServerInfo.Team1Score) >= 6) {
                        return {success: false, message: 'A team has won more than 5 rounds you cannot abandon'};
                    }
                } catch (e) {
                    await logWarn("Score returned by server nonexistent", this.client);
                }
            }
            catch (e) {
                await logWarn(`${e}`, this.client);
            }
        }
        const acceptFail = this.stage == Stages.accept
        let dbUser = await cacheController.getUserById(user.dbID) as UserInt;
        const now = moment().unix();
        dbUser = await punishment(dbUser, acceptFail, 0, now);

        await this.sendGameEndMessage("abandoned");

        await sendAbandonMessage(this.guild, dbUser, now, acceptFail);
        return {success: true, message: 'You have abandoned the game'};
    }

    private async sendGameEndMessage(message: string) {
        const roleID = this.acceptStage.getRoleID();
        let requeue = true;
        if (this.stage == Stages.accept) {
            const channel = await this.guild.channels.fetch(this.acceptStage.getChannelID()) as TextChannel;
            await channel.send({content: `<@&${roleID}> this game has been ${message} you have been automatically placed into queue`});
        } else if (this.stage == Stages.vote) {
            const channelA = await this.guild.channels.fetch(this.voteData.teamAChannelID) as TextChannel;
            await channelA.send({content: `<@&${roleID}> this game has been ${message} you have been automatically placed into queue`});
            const channelB = await this.guild.channels.fetch(this.voteData.teamBChannelID) as TextChannel;
            await channelB.send({content: `<@&${roleID}> this game has been ${message} you have been automatically placed into queue`});
        } else {
            const channel = await this.guild.channels.fetch(this.finalData.channelID) as TextChannel;
            if (this.finalGenTime + 15 * 60 >= moment().unix()) {
                await channel.send({content: `<@&${roleID}> this game has been ${message} you can re ready now`});
                requeue = false;
            } else {
                await channel.send({content: `<@&${roleID}> this game has been ${message} you have been automatically placed into queue`});
            }
        }
        for (let user of this.users) {
            if (!user.discordMember.dmChannel) {
                await user.discordMember.createDM(true);
            }
            const dbUser = await cacheController.getUserById(user.dbID) as UserInt;
            if (dbUser.dmMatch) {
                try {
                    if (requeue) {
                        await user.discordMember.dmChannel!.send(`The match has been ${message}, you have been automatically placed into queue`);
                        const now = moment().unix();
                        const requeueArr: GameUser[] = []
                        for (let user of this.users) {
                            const dbUser = await cacheController.getUserById(user.dbID) as UserInt;
                            if (dbUser.banUntil <= now) {
                                requeueArr.push(user);
                            }
                        }
                        this.data.reReady(requeueArr);
                    } else {
                        await user.discordMember.dmChannel!.send(`The match has been ${message}, you can re ready now`);
                    }
                } catch (e) {
                    await logWarn(`Could not dm user -${dbUser.id}`, this.client);
                }
            }
        }
    }

    public async vote(id: string, vote: mapIndex): Promise<InternalResponse>  {
        const votes = this.currentStage.getVotes()
        const userVotes = votes.get(id);
        let message;
        let validVote = false;
        const votingTeam = this.votingTeam;
        for (let user of this.users) {
            if (user.team == votingTeam && user.discordMember.id == id) {
                validVote = true;
            }
        }

        if (!validVote) {
            return {success: false, message: "You cannot vote as you are not on this team"};
        }
        const mapManager = this.data.getMapManager();
        const matchNumber = this.matchNumber
        if (userVotes) {
            if (userVotes.includes(vote)) {
                userVotes.forEach((value, index) => {if (value == vote) userVotes.splice(index, 1);});
                this.currentStage.setVotes(id, userVotes)
                message = `Removed vote for ${mapManager.getMapNameByGame(matchNumber, vote)}`;
            } else if (userVotes.length == this.currentStage.getMaxVotes()) {
                return {
                    success: false,
                    message: `Please remove one of your previous votes:${getPreviousVotes(userVotes, matchNumber, mapManager)}`
                }
            } else {
                userVotes.push(vote);
                this.currentStage.setVotes(id, userVotes);
                message = `Added vote for ${mapManager.getMapNameByGame(matchNumber, vote)}`;
            }
        } else {
            this.currentStage.setVotes(id, [vote])
            message = `Added vote for ${mapManager.getMapNameByGame(matchNumber, vote)}`;
        }
        await this.currentStage.updateVoteCounts();
        return {success: true, message: message};
    }

    public getAbandoned() {
        return this.abandoned;
    }

    public getUsers() {
        return this.users;
    }

    public getVoteData() {
        return this.voteData;
    }

    public isProcessed() {
        return this.processed;
    }

    public hasEnded() {
        return this.gameEnded;
    }

    public accept(id: string): InternalResponse {
        for (let user of this.users) {
            if (user.discordMember.id == id) {
                user.accepted = true;
                return {success: true, message: "You have accepted your game"};
            }
        }
        return {success: false, message: "Could not find user, please contact a moderator"};
    }

    public hasChannel(channelID: string) {
        return this.channels.includes(channelID);
    }

    public hasUser(id: ObjectId) {
        for (let user of this.users) {
            if (String(id) == String(user.dbID)) {
                return true;
            }
        }
        return false;
    }

    public addChannel(channelID: string) {
        this.channels.push(channelID);
    }

    public getMissing() {
        let missingStr = '';
        for (let user of this.users) {
            if (!user.accepted) {
                missingStr += `<@${user.discordMember.id}>  `;
            }
        }
        return missingStr + "\nPlease accept the match";
    }

    public setMap(map: string) {
        this.map = map;
    }

    public setSides(sides: [string, string]) {
        this.sides = sides;
    }

    public getMap() {
        return this.map;
    }

    public getEmbedUsers(): {titleA: string, titleB: string, teamA: string, teamB: string} {
        let titleA: string;
        let titleB: string;
        let teamA = "";
        let teamB = "";
        if (this.stage == Stages.accept) {
            titleA = "Accepted";
            titleB = "Not Yet Accepted";
            for (let user of this.users) {
                if (user.accepted) {
                    teamA += `<@${user.discordMember.id}>\n`;
                } else {
                    teamB += `<@${user.discordMember.id}>\n`;
                }
            }
            if (teamA == "") {
                teamA = "No players have accepted yet";
            }
            if (teamB == "") {
                teamB = "All players have accepted";
            }
        } else {
            titleA = "Team A";
            titleB = "Team B";
            for (let user of this.users) {
                if (user.team == 0) {
                    teamA += `<@${user.discordMember.id}>\n`;
                } else {
                    teamB += `<@${user.discordMember.id}>\n`;
                }
            }
        }
        return {
            titleA: titleA,
            titleB: titleB,
            teamA: teamA,
            teamB: teamB,
        }
    }

    public async submitScore(user: UserInt, score: number): Promise<InternalResponse> {
        if (this.submitCooldown > 0) {
            return {success: false, message: "Please wait before submitting scores"};
        }
        const team = this.getTeam(user._id);
        if (team < 0) {
            return {success: false, message: "Could not find team"};
        }
        if (this.scores[0] < 0 && this.scores[1] < 0) {
            this.scores[team] = score;
            await logScoreSubmit(user.id, this.matchNumber, score, this.client);
            return {success: true, message: `Score of ${score} submitted for team ${team == 0 ? "a" : "b"} by <@${user.id}>`};
        } else {
            let scoreA = this.scores[0];
            let scoreB = this.scores[1];

            if (team == 0) {
                scoreA = score;
            } else {
                scoreB = score;
            }
            if (((scoreA + scoreB) <= 19) && scoreA <= 10 && scoreB <= 10) {
                if (scoreA >= 0 && scoreB >= 0) {
                    this.scoreConfirmSent = false;
                    this.scores = [scoreA, scoreB];
                    await this.next();
                }
                await logScoreSubmit(user.id, this.matchNumber, score, this.client);
                return {success: true, message: `Score of ${score} submitted for ${(team == 0) ? "team a" : "team b"} by <@${user.id}>`};
            } else if (team == 0) {
                this.scores[0] = scoreA;
                await logScoreSubmit(user.id, this.matchNumber, score, this.client);
                return {success: true, message: `Score of ${score} submitted for team a by <@${user.id}>`};
            } else if (team == 1) {
                this.scores[1] = scoreB;
                await logScoreSubmit(user.id, this.matchNumber, score, this.client);
                return {success: true, message: `Score of ${score} submitted for team b by <@${user.id}>`};
            } else {
                return {success: false, message: `Invalid score of ${score} submitted`}
            }
        }
    }

    public async acceptScore(id: ObjectId): Promise<InternalResponse> {
        const team = this.getTeam(id);
        if (team >= 0) {

            const channel = await this.client.channels.fetch(this.finalData.channelID) as TextChannel;
            if (team == 0) {
                this.scoresAccepted[0] = true;
                await channel.send("Team a has accepted scores");
            } else {
                this.scoresAccepted[1] = true;
                await channel.send("Team b has accepted scores");
            }
            return {success: true, message: 'Accepted scores'};
        }
        return {success: false, message: 'Could not find team'};
    }

    public forceScore(scoreA: number, scoreB: number): InternalResponse {
        if ((scoreA == tokens.ScoreLimit && scoreB == tokens.ScoreLimit) || (scoreA == tokens.ScoreLimit && scoreB != tokens.ScoreLimit) || (scoreB == tokens.ScoreLimit && scoreA != tokens.ScoreLimit)) {
            return {success: false, message: 'Invalid scores'}
        }
        this.scores = [scoreA, scoreB];
        this.stage = Stages.processing;
        return {success: true, message: `Scores force submitted
        \`team_a: ${scoreA}\nteam_b: ${scoreB}\``}
    }

    public async nullify() {
        this.nullified = true;
        await this.sendGameEndMessage('nullified');
        return true;
    }

    public toggleRequeue(id: ObjectId): InternalResponse {
        if (this.requeueArray.find((item) => {return String(item) == String(id)})) {
            this.requeueArray.forEach((value, index) => {
                if (String(value) == String(id)) this.requeueArray.splice(index, 1);
            })
            return {success: true, message: "You will no longer be auto queued"}
        } else {
            this.requeueArray.push(id)
            return {success: true, message: "You will be auto queued for the next game"}
        }
    }

    public async resetSND(id: string): Promise<InternalResponse> {
        if (this.server) {
            const res = await this.server.resetSND();
            if (res.Successful) {
                return {success: true, message: `Game has been reset by <@${id}>`};
            } else {
                return {success: false, message: `Game failed to be reset`};
            }
        } else {
            return {success: false, message: "Server not assigned for this game"};
        }
    }

    public async switchMap(id: string): Promise<InternalResponse> {
        if (this.server) {
            const map = this.data.getMapManager().getMap(this.map);
            const res = await this.server.switchMap(map!.resourceID, "SND");
            if (res.Successful) {
                return {success: true, message: `Map has been switched by <@${id}>`};
            } else {
                return {success: false, message: `Map failed to switch`};
            }
        } else {
            return {success: false, message: "Server not assigned for this game"};
        }
    }

    public getInfo(): GameData {
        let userData: string[] = []
        for (let user of this.users) {
            userData.push(`<@${user.discordMember.id}>`)
        }
        return {
            matchNumber: this.matchNumber,
            tickCount: this.tickCount,
            state: this.state,
            stage: this.stage,
            users: userData,
        }
    }

    private getTeam(userId: ObjectId) {
        for (let user of this.users) {
            if (String(user.dbID) == String(userId)) {
                return user.team;
            }
        }
        return -1;
    }

    public getRequeue() {
        return this.requeueArray;
    }

    public clearRequeue() {
        this.requeueArray = [];
    }

    public getRoleID() {
        return this.acceptStage.getRoleID();
    }

    public getFinalInfo() {
        const server = !(this.server == null);
        let message: string;
        if (server) {
            message = `This match should be played on the server titled: \`SMM Match-${this.matchNumber}\`\nLobby region: ${this.region}`
        } else {
            message = `This match should be played in the ${this.region} region`
        }
        return {
            server: server,
            message: message,
        }
    }

    public getSides() {
        return this.sides;
    }
}
