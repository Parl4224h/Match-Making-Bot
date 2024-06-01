import GameStage from "../GameStage";
import tokens from "../../config/tokens";
import {GameController} from "../../controllers/GameController";
import {TextChannel} from "discord.js";
import {calcSide, getTotals} from "../../utility/vote.util";
import {voteAB2} from "../../views/game.views";
import {logWarn} from "../../utility/loggers";

export class SelectSideStage extends GameStage {
    private voteCountdown = tokens.VoteTime;

    private messageSent = false;
    private messageID = "";

    private votes: Map<string, string[]> = new Map<string, string[]>();
    private readonly maxVotes = 1;
    private selection: string = "";

    constructor(game: GameController) {
        super(game);
    }

    public async gameEnd() {
        await super.gameEnd();
        const voteData = this.game.getVoteData();
        const guild = this.game.guild;
        const teamARole = await guild.roles.fetch(voteData.teamARoleID);
        const teamBRole = await guild.roles.fetch(voteData.teamBRoleID);
        const teamAVC = await guild.channels.fetch(voteData.teamAVCID);
        const teamBVC = await guild.channels.fetch(voteData.teamBVCID);

        try {
            await teamARole?.delete();
        } catch (e) {
            await logWarn("Could not delete team a role", this.game.client);
        }
        try {
            await teamBRole?.delete();
        } catch (e) {
            await logWarn("Could not delete team b role", this.game.client);
        }
        try {
            await teamAVC?.delete();
        } catch (e) {
            await logWarn("Could not delete team a vc", this.game.client);
        }
        try {
            await teamBVC?.delete();
        } catch (e) {
            await logWarn("Could not delete team b vc", this.game.client);
        }

        // Only delete channels if stage has not passed yet
        if (this.selection == "") {
            const teamAChannel = await guild.roles.fetch(voteData.teamAChannelID);
            const teamBChannel = await guild.roles.fetch(voteData.teamBChannelID);
            try {
                await teamAChannel?.delete();
            } catch (e) {
                await logWarn("Could not delete team a channel", this.game.client);
            }
            try {
                await teamBChannel?.delete();
            } catch (e) {
                await logWarn("Could not delete team b channel", this.game.client);
            }
        }
    }

    public async start() {
        await super.start();
        const voteData = this.game.getVoteData();

        const teamAChannel = await this.game.client.channels.fetch(voteData.teamAChannelID) as TextChannel;
        const teamBChannel = await this.game.client.channels.fetch(voteData.teamBChannelID) as TextChannel;

        const teamBMessage = await teamBChannel.send({
            components: [voteAB2(
                "CT", 0,
                "T", 0,
            )],
            content: `Please select a side`
        });
        this.messageID = teamBMessage.id;
        this.messageSent = true;

        await teamAChannel.send({content: `Team B is selecting a side`});
    }

    public async cleanup() {
        await super.cleanup();
        const voteData = this.game.getVoteData();

        // Edit message
        const teamBChannel = await this.game.guild.channels.fetch(voteData.teamBChannelID) as TextChannel;
        const voteMessage = await teamBChannel.messages.fetch(this.messageID);
        await voteMessage.edit({content: `~~${voteMessage.content}~~ Voting has completed`, components: []});

        // Send message with bans
        const teamAChannel = await this.game.guild.channels.fetch(voteData.teamAChannelID) as TextChannel;
        await teamAChannel.send(`${this.selection} was selected`);
        await teamBChannel.send(`${this.selection} was selected`);

        await teamAChannel.delete();
        await teamBChannel.delete();
    }

    public async tick() {
        await super.tick()
        if (this.messageSent) {
            this.voteCountdown--;
        }
        if (this.voteCountdown <= 0 && !this.working) {
            this.working = true;
            const res = await calcSide(this.votes, this.game.matchNumber, this.game.client)
            this.selection = res[1];
            this.game.setSides(res);
            await super.next();
        }
    }

    public getVotes(): Map<string, string[]> {
        return this.votes;
    }

    public setVotes(id: string, votes: string[]) {
        this.votes.set(id, votes);
    }

    public getMaxVotes(): number {
        return this.maxVotes;
    }

    public async updateVoteCounts() {
        const totals = getTotals(this.votes, 2);

        const voteData = this.game.getVoteData();

        const teamAChannel = await this.game.guild.channels.fetch(voteData.teamAChannelID) as TextChannel;
        const mapVoteMessage = await teamAChannel.messages.fetch(this.messageID);
        await mapVoteMessage.edit({content: mapVoteMessage.content,
            components: [voteAB2(
                "CT", totals.get("1")!,
                "T", totals.get("2")!,
            )]});
    }
}