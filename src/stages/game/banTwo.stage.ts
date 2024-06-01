import GameStage from "../GameStage";
import tokens from "../../config/tokens";
import {GameController} from "../../controllers/GameController";
import {TextChannel} from "discord.js";
import {grammaticalList} from "../../utility/grammatical";
import {calcVotes, getTotals, VoteTypes} from "../../utility/vote.util";
import {voteB1} from "../../views/game.views";

export class BanTwoStage extends GameStage {
    private voteCountdown = tokens.VoteTime;

    private messageSent = false;
    private messageID = "";

    private votes: Map<string, string[]> = new Map<string, string[]>();
    private readonly maxVotes = 2;
    private bans: string[] = [];

    constructor(game: GameController) {
        super(game);
    }

    public async start() {
        await super.start();
        const mapManager = this.game.data.getMapManager();
        const matchNumber = this.game.matchNumber;
        const voteData = this.game.getVoteData();

        const teamAChannel = await this.game.client.channels.fetch(voteData.teamAChannelID) as TextChannel;
        const teamBChannel = await this.game.client.channels.fetch(voteData.teamBChannelID) as TextChannel;

        const teamBMessage = await teamBChannel.send({
            components: [voteB1(
                mapManager.getMapNameByGame(matchNumber, "1"), 0,
                mapManager.getMapNameByGame(matchNumber, "2"), 0,
                mapManager.getMapNameByGame(matchNumber, "3"), 0,
                mapManager.getMapNameByGame(matchNumber, "4"), 0,
            )],
            content: `Please ban two maps`
        });
        this.messageID = teamBMessage.id;
        this.messageSent = true;

        await teamAChannel.send({content: `Team B is banning two maps`});
    }

    public async cleanup() {
        await super.cleanup();
        const voteData = this.game.getVoteData();

        // Edit Message
        const teamBChannel = await this.game.guild.channels.fetch(voteData.teamBChannelID) as TextChannel;
        const voteMessage = await teamBChannel.messages.fetch(this.messageID);
        await voteMessage.edit({ content: `~~${voteMessage.content}~~ Voting has completed`, components: []});

        // Send ban messages
        const teamAChannel = await this.game.guild.channels.fetch(voteData.teamAChannelID) as TextChannel;
        await teamAChannel.send(`${grammaticalList(this.bans)} were banned`);
        await teamBChannel.send(`${grammaticalList(this.bans)} were banned`);
    }

    public async tick() {
        await super.tick();
        if (this.messageSent) {
            this.voteCountdown--;
        }
        if (this.voteCountdown <= 0 && !this.working) {
            this.working = true;
            this.bans = await calcVotes(this.votes, VoteTypes.banTwo, "B", this.game.matchNumber, this.game.data.getMapManager(), this.game.client)
            this.game.getVoteData().bannedMaps = this.game.getVoteData().bannedMaps.concat(this.bans);
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
        const totals = getTotals(this.votes, 4);

        const voteData = this.game.getVoteData();
        const mapManager = this.game.data.getMapManager();
        const matchNumber = this.game.matchNumber;

        const teamBChannel = await this.game.guild.channels.fetch(voteData.teamBChannelID) as TextChannel;
        const mapVoteMessage = await teamBChannel.messages.fetch(this.messageID);
        this.game.data.getMapManager().newIndices(this.game.matchNumber);
        await mapVoteMessage.edit({content: mapVoteMessage.content,
            components: [voteB1(
                mapManager.getMapNameByGame(matchNumber, "1"), totals.get("1")!,
                mapManager.getMapNameByGame(matchNumber, "2"), totals.get("2")!,
                mapManager.getMapNameByGame(matchNumber, "3"), totals.get("3")!,
                mapManager.getMapNameByGame(matchNumber, "4"), totals.get("4")!,
            )]});
    }
}