import GameStage from "../GameStage";
import {logWarn} from "../../utility/loggers";
import {ChannelType} from "discord.js";
import {getMatchPerms} from "../../utility/channelPermissions";
import discordTokens from "../../config/discordTokens";
import {initialSubmit, initialSubmitServer} from "../../views/game.views";
import {teamsEmbed} from "../../embeds/game.embeds";

export class FinalStage extends GameStage {
    public readonly type: string = "final";

    private channelGen = false;
    private channelID = "";

    public async tick() {
        await super.tick();
        if (!this.channelGen) {
            await this.channelGenTask();
        }
    }

    public async cleanup() {
        await super.cleanup();
    }

    public async gameEnd() {
        await super.gameEnd();
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

    private async channelGenTask() {
        this.channelGen = true;
        const channel = await this.game.guild.channels.create({
            name: `match-${this.game.matchNumber}`,
            type: ChannelType.GuildText,
            permissionOverwrites: getMatchPerms(this.game.getRoleID(), false),
            position: 0,
            parent: discordTokens.MatchCategory,
            reason: 'Create final match channel',
        });
        this.channelID = channel.id;
        this.game.addChannel(channel.id);
        this.game.finalData.channelID = channel.id;

        const gameInfo = this.game.getFinalInfo();

        await channel.send({
            content: gameInfo.message,
            components: [gameInfo.server ? initialSubmitServer() : initialSubmit()],
            embeds: [await teamsEmbed(this.game.getUsers(), this.game.matchNumber, "SND", this.game.getMap(), this.game.getSides(), this.game.data.getMapManager())]
        })
    }
}