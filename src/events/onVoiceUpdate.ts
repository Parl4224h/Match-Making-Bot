import {StageChannel, VoiceState} from "discord.js";
import {Data} from "../data";
import discordTokens from "../config/discordTokens";
import {logWarn} from "../utility/loggers";

export const onVoiceUpdate = async (oldState: VoiceState, newState: VoiceState, data: Data) => {
    try {
        const isStage = newState.channel instanceof StageChannel;
        const invite = data.getQueue().getSpeakingPermission(newState.channelId!, newState.member!);
        if ((isStage && newState.requestToSpeakTimestamp == null)) {
            if (invite.canSpeak && newState.suppress) {
                await newState.setSuppressed(false);
            }
        }
        let isMod = false;
        for (let role of newState.member!.roles.cache) {
            if (discordTokens.Moderators.includes(role[0])) {
                isMod = true;
                break;
            }
        }
        if (!invite.canJoin && !isMod) {
            await newState.disconnect("Joined opposing team's stage")
        }
    } catch (e) {
        await logWarn("voiceUpdateError", oldState.client);
    }
}