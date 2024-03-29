import GameStage, {voteStage} from "../GameStage";
import {GameController} from "../../controllers/GameController";
import tokens from "../../config/tokens";
import {ChannelType, StageInstancePrivacyLevel} from "discord.js";
import discordTokens from "../../config/discordTokens";
import {getMatchPerms, getStagePerms} from "../../utility/channelPermissions";
import {calcVotes} from "../../utility/vote.util";

export class BanThreeStage extends GameStage implements voteStage {
    public readonly type: string = "vote";
    private voteCountdown = tokens.VoteTime;

    private channelGen = false;
    private channelID = "";
    private messageSent = false;
    private messageID = "";

    private teamAChannelID = "";
    private teamBChannelID = "";
    private teamARoleID = "";
    private teamBRoleID = "";
    private teamAVCID = "";
    private teamBVCID = "";

    private mapSet = {
        '1': "",
        '2': "",
        '3': "",
        '4': "",
        '5': "",
        '6': "",
        '7': "",
    }

    constructor(game: GameController) {
        super(game);
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
            this.working = true;
            const bans = calcVotes()
        }
    }

    public async addVote() {

    }

    public async removeVote() {

    }


    private async channelGenTask() {
        this.channelGen = true;

        const teamARole = await this.game.guild.roles.create({
            name: `team-a-${this.game.matchNumber}`,
            reason: 'Create role for team a'
        });
        this.teamARoleID = teamARole.id;

        const teamBRole = await this.game.guild.roles.create({
            name: `team-b-${this.game.matchNumber}`,
            reason: 'Create role for team b'
        });
        this.teamBRoleID = teamBRole.id;

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
        this.teamAChannelID = teamAChannel.id;

        const teamBChannel = await this.game.guild.channels.create({
                name: `team-b-${this.game.matchNumber}`,
                type: ChannelType.GuildText,
                permissionOverwrites: getMatchPerms(teamBRole, false),
                position: 0,
                parent: discordTokens.MatchCategory,
                reason: 'Create channel for team a'
            }
        );
        this.teamBChannelID = teamBChannel.id;

        const teamAVC = await this.game.guild.channels.create({
            name: `Team A-${this.game.matchNumber}`,
            type: ChannelType.GuildStageVoice,
            permissionOverwrites: getStagePerms(teamARole),
            position: 0,
            parent: discordTokens.MatchCategory,
            reason: 'Create vc for team a',
        });
        this.teamAVCID = teamAVC.id;

        const teamBVC = await this.game.guild.channels.create({
            name: `Team B-${this.game.matchNumber}`,
            type: ChannelType.GuildStageVoice,
            permissionOverwrites: getStagePerms(teamBRole),
            position: 0,
            parent: discordTokens.MatchCategory,
            reason: 'Create vc for team b',
        });
        this.teamBVCID = teamBVC.id;


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

        const teamAMessage = await teamAChannel.send({
            components: voteA1(this.mapSet["1"], 0, this.mapSet["2"], 0, this.mapSet["3"], 0, this.mapSet["4"],
                0, this.mapSet["5"], 0, this.mapSet["6"], 0, this.mapSet["7"], 0),
            content: `Team A - ${teamAStr}Please ban three maps`});
        this.messageID = teamAMessage.id;
        this.messageSent = true;

        await teamBChannel.send({content: `Team B - ${teamBStr}Team A is banning 3 maps`});
    }
}