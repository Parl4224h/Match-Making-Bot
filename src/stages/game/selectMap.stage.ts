import GameStage from "../GameStage";
import tokens from "../../config/tokens";
import {GameController} from "../../controllers/GameController";
import {TextChannel} from "discord.js";
import {calcVotes, getTotals, VoteTypes} from "../../utility/vote.util";
import {voteAB2} from "../../views/game.views";

export class SelectMapStage extends GameStage {
    private voteCountdown = tokens.VoteTime;

    private messageSent = false;
    private messageID = "";

    private votes: Map<string, string[]> = new Map<string, string[]>();
    private readonly maxVotes = 1;
    private selection: string = "";

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

        const teamAMessage = await teamAChannel.send({
            components: [voteAB2(
                mapManager.getMapNameByGame(matchNumber, "1"), 0,
                mapManager.getMapNameByGame(matchNumber, "2"), 0,
            )],
            content: `Please select a map`
        });
        this.messageID = teamAMessage.id;
        this.messageSent = true;

        await teamBChannel.send({content: `Team A is selecting a map`});
    }

    public async cleanup() {
        await super.cleanup();
        const voteData = this.game.getVoteData();

        // Edit message
        const teamAChannel = await this.game.guild.channels.fetch(voteData.teamAChannelID) as TextChannel;
        const voteMessage = await teamAChannel.messages.fetch(this.messageID);
        await voteMessage.edit({content: `~~${voteMessage.content}~~ Voting has completed`, components: []});

        // Send message with bans
        const teamBChannel = await this.game.guild.channels.fetch(voteData.teamBChannelID) as TextChannel;
        await teamAChannel.send(`${this.selection} was selected`);
        await teamBChannel.send(`${this.selection} was selected`);
    }

    public async tick() {
        await super.tick()
        if (this.messageSent) {
            this.voteCountdown--;
        }
        if (this.voteCountdown <= 0 && !this.working) {
            this.working = true;
            const res = await calcVotes(this.votes, VoteTypes.selectOne, "A", this.game.matchNumber, this.game.data.getMapManager(), this.game.client)
            this.selection = res[0];
            this.game.setMap(this.selection);
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
        const mapManager = this.game.data.getMapManager();
        const matchNumber = this.game.matchNumber;

        const teamAChannel = await this.game.guild.channels.fetch(voteData.teamAChannelID) as TextChannel;
        const mapVoteMessage = await teamAChannel.messages.fetch(this.messageID);
        await mapVoteMessage.edit({content: mapVoteMessage.content,
            components: [voteAB2(
                mapManager.getMapNameByGame(matchNumber, "1"), totals.get("1")!,
                mapManager.getMapNameByGame(matchNumber, "2"), totals.get("2")!,
            )]});
    }
}