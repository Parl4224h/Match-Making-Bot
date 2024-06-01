import GameStage from "../GameStage";
import {GameController} from "../../controllers/GameController";
import tokens from "../../config/tokens";
import {ChannelType, StageInstancePrivacyLevel, TextChannel} from "discord.js";
import discordTokens from "../../config/discordTokens";
import {getMatchPerms, getStagePerms} from "../../utility/channelPermissions";
import {calcVotes, getTotals, VoteTypes} from "../../utility/vote.util";
import {voteA1} from "../../views/game.views";
import {grammaticalList} from "../../utility/grammatical";



export class BanThreeStage extends GameStage {
    private voteCountdown = tokens.VoteTime;

    private channelGen = false;
    private messageSent = false;
    private messageID = "";

    private votes: Map<string, string[]> = new Map<string, string[]>();
    private readonly maxVotes = 3;
    private bans: string[] = [];


    constructor(game: GameController) {
        super(game);
    }

    public async start() {
        await super.start();
        this.game.data.getMapManager().registerGame(this.game.matchNumber);
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
        await teamAChannel.send(`${grammaticalList(this.bans)} were banned`);
        await teamBChannel.send(`${grammaticalList(this.bans)} were banned`);
    }

    public async tick() {
        await super.tick();
        if (this.messageSent) {
            this.voteCountdown--;
        }
        if (!this.channelGen) {
            await this.channelGenTask()
        }
        if (this.voteCountdown <= 0 && !this.working) {
            try {
                this.working = true;
                this.bans = await calcVotes(this.votes, VoteTypes.banThree, "A", this.game.matchNumber, this.game.data.getMapManager(), this.game.client);
                this.game.getVoteData().bannedMaps = this.game.getVoteData().bannedMaps.concat(this.bans);
                this.game.data.getMapManager().registerBans(this.game.matchNumber, this.bans);
                await super.next();
            } catch (e) {
                console.error(e);
            }
        }
    }

    public async updateVoteCounts() {
        const totals = getTotals(this.votes, 7);

        const voteData = this.game.getVoteData();
        const mapManager = this.game.data.getMapManager();
        const matchNumber = this.game.matchNumber;

        const teamAChannel = await this.game.guild.channels.fetch(voteData.teamAChannelID) as TextChannel;
        const mapVoteMessage = await teamAChannel.messages.fetch(this.messageID);
        await mapVoteMessage.edit({content: mapVoteMessage.content,
            components: voteA1(
                mapManager.getMapNameByGame(matchNumber, "1"), totals.get("1")!,
                mapManager.getMapNameByGame(matchNumber, "2"), totals.get("2")!,
                mapManager.getMapNameByGame(matchNumber, "3"), totals.get("3")!,
                mapManager.getMapNameByGame(matchNumber, "4"), totals.get("4")!,
                mapManager.getMapNameByGame(matchNumber, "5"), totals.get("5")!,
                mapManager.getMapNameByGame(matchNumber, "6"), totals.get("6")!,
                mapManager.getMapNameByGame(matchNumber, "7"), totals.get("7")!
            )});
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

    private async channelGenTask() {
        this.channelGen = true;

        const voteData = this.game.getVoteData()

        const teamARole = await this.game.guild.roles.create({
            name: `team-a-${this.game.matchNumber}`,
            reason: 'Create role for team a'
        });
        voteData.teamARoleID = teamARole.id;

        const teamBRole = await this.game.guild.roles.create({
            name: `team-b-${this.game.matchNumber}`,
            reason: 'Create role for team b'
        });
        voteData.teamBRoleID = teamBRole.id;

        // Add the team roles to each player
        for (let user of this.game.getUsers()) {
            if (user.team == 0) {
                await user.discordMember.roles.add(teamARole)
            } else {
                await user.discordMember.roles.add(teamBRole)
            }
        }

        const teamAChannel = await this.game.guild.channels.create({
                name: `team-a-${this.game.matchNumber}`,
                type: ChannelType.GuildText,
                permissionOverwrites: getMatchPerms(teamARole, false),
                position: 0,
                parent: discordTokens.MatchCategory,
                reason: 'Create channel for team a'
            }
        );
        voteData.teamAChannelID = teamAChannel.id;

        const teamBChannel = await this.game.guild.channels.create({
                name: `team-b-${this.game.matchNumber}`,
                type: ChannelType.GuildText,
                permissionOverwrites: getMatchPerms(teamBRole, false),
                position: 0,
                parent: discordTokens.MatchCategory,
                reason: 'Create channel for team a'
            }
        );
        voteData.teamBChannelID = teamBChannel.id;

        const teamAVC = await this.game.guild.channels.create({
            name: `Team A-${this.game.matchNumber}`,
            type: ChannelType.GuildStageVoice,
            permissionOverwrites: getStagePerms(teamARole),
            position: 0,
            parent: discordTokens.MatchCategory,
            reason: 'Create vc for team a',
        });
        voteData.teamAVCID = teamAVC.id;

        const teamBVC = await this.game.guild.channels.create({
            name: `Team B-${this.game.matchNumber}`,
            type: ChannelType.GuildStageVoice,
            permissionOverwrites: getStagePerms(teamBRole),
            position: 0,
            parent: discordTokens.MatchCategory,
            reason: 'Create vc for team b',
        });
        voteData.teamBVCID = teamBVC.id;


        // Start each stage since users cannot do so themselves
        await teamAVC.createStageInstance({
            privacyLevel: StageInstancePrivacyLevel.GuildOnly,
            sendStartNotification: false, // Important to be false otherwise will @everyone
            topic: `Team A-${this.game.matchNumber}`,
        });

        await teamBVC.createStageInstance({
            privacyLevel: StageInstancePrivacyLevel.GuildOnly,
            sendStartNotification: false, // Important to be false otherwise will @everyone
            topic: `Team B-${this.game.matchNumber}`,
        });

        // Prepare team mentions
        let teamAStr = "";
        let teamBStr = "";
        for (let player of this.game.getUsers()) {
            if (player.team == 0) {
                teamAStr += `<@${player.discordMember.id}> `;
            } else {
                teamBStr += `<@${player.discordMember.id}> `;
            }
        }


        const mapManager = this.game.data.getMapManager();
        const matchNumber = this.game.matchNumber;
        const teamAMessage = await teamAChannel.send({
            components: voteA1(
                mapManager.getMapNameByGame(matchNumber, "1"), 0,
                mapManager.getMapNameByGame(matchNumber, "2"), 0,
                mapManager.getMapNameByGame(matchNumber, "3"), 0,
                mapManager.getMapNameByGame(matchNumber, "4"), 0,
                mapManager.getMapNameByGame(matchNumber, "5"), 0,
                mapManager.getMapNameByGame(matchNumber, "6"), 0,
                mapManager.getMapNameByGame(matchNumber, "7"), 0
            ),
            content: `Team A - ${teamAStr}Please ban three maps`
        });
        this.messageID = teamAMessage.id;
        this.messageSent = true;

        await teamBChannel.send({content: `Team B - ${teamBStr}Team A is banning 3 maps`});

        this.game.addChannel(teamAChannel.id);
        this.game.addChannel(teamBChannel.id);
    }
}