import GameStage from "../GameStage";
import {GameController} from "../../controllers/GameController";
import tokens from "../../config/tokens";
import {ChannelType, TextChannel} from "discord.js";
import discordTokens from "../../config/discordTokens";
import {getAcceptPerms} from "../../utility/channelPermissions";
import {getUserById} from "../../modules/getters/getUser";
import {logWarn} from "../../utility/loggers";
import {grammaticalTime} from "../../utility/grammatical";
import {GameUser} from "../../interfaces/Internal";
import {acceptView} from "../../views/gameViews";

export class AcceptStage extends GameStage {
    public readonly type: string = "accept";
    private acceptCountdown = tokens.AcceptTime;
    private channelGen = false;
    private channelID = "";
    private failed = false
    private messageID = "";
    private roleID = "";

    constructor(game: GameController) {
        super(game);
    }

    public async tick() {
        await super.tick();
        this.acceptCountdown--;
        if (!this.channelGen) {
            await this.channelGenTask();
        }
        await this.checkAcceptedTask();
        if (this.acceptCountdown == tokens.PingTime) {
            await this.sendPings()
        }
        if (this.acceptCountdown <= 0 && !this.game.getAbandoned() && !this.failed) {
            await this.failedTask();
        }
    }

    public async cleanup() {
        await super.cleanup();
        const channel = await this.game.guild.channels.fetch(this.channelID);
        if (channel) {
            try {
                await channel.delete();
            } catch (e) {
                console.error(e);
                await logWarn("Could not delete accept channel", this.game.client);
            }
        }
    }

    public async gameEnd() {
        await super.gameEnd();
        const role = await this.game.guild.roles.fetch(this.roleID);
        if (role) {
            try {
                await role.delete();
            } catch (e) {
                console.error(e);
                await logWarn("Could not delete match role", this.game.client);
            }
        }
    }

    private async sendPings() {
        const acceptChannel = await this.game.client.channels.fetch(this.channelID) as TextChannel
        for (let user of this.game.getUsers()) {
            if (!user.accepted) {
                await acceptChannel.send({content: `<@${user.discordMember.id}> you have ${grammaticalTime(tokens.PingTime)} to accept the match`});
            }
        }
    }

    private async failedTask() {
        this.failed = true;
        const acceptChannel = await this.game.client.channels.fetch(this.channelID) as TextChannel
        const message = await acceptChannel.messages.fetch(this.messageID);
        await message.edit({content: message.content, components: []});
        const newUsers: GameUser[] = [];
        for (let user of this.game.getUsers()) {
            if (!user.accepted) {
                await this.game.abandon(user.discordMember.id, true, true);
            } else {
                newUsers.push(user);
            }
        }
        await this.game.data.addAbandoned(newUsers);
    }

    private async checkAcceptedTask() {
        let accepted = true;
        for (let user of this.game.getUsers()) {
            if (!user.accepted) {
                accepted = false;
                break;
            }
        }
        if (accepted) {
            this.next();
        }
    }

    private async channelGenTask() {
        const role = await this.game.guild.roles.create({
            name: `match-${this.game.matchNumber}`,
            reason: 'Create role for match accept'
        });
        this.roleID = role.id;

        this.channelGen = true;
        const channel = await this.game.guild.channels.create({
            name: `match-${this.game.matchNumber}`,
            type: ChannelType.GuildText,
            permissionOverwrites: getAcceptPerms(role),
            position: 0,
            parent: discordTokens.MatchCategory,
            reason: 'Create channel for match accept'
        });



        // Add role to all users and send dm notifying of match
        for (let user of this.game.getUsers()) {
            await user.discordMember.roles.add(role);
            if (!user.discordMember.dmChannel) {
                await user.discordMember.createDM(true);
            }
            const dbUser = await getUserById(user.dbID);
            if (dbUser.dmMatch) {
                try {
                    await user.discordMember.dmChannel!.send(`A game has started please accept the game here ${channel.url} within 3 minutes`)
                } catch (e) {
                    await logWarn(`Could not warn user-${user.discordMember.id}`, this.game.client);
                }
            }

        }
        const message = await channel.send({content: `${role.toString()} ${await this.game.data.getMessage('accept')}`, components: [acceptView()]});
        await message.pin();
        this.messageID = message.id;
    }
}