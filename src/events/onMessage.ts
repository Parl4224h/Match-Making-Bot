import {Message} from "discord.js";
import {Data} from "../data";
import {logWarn} from "../utility/loggers";
import discordTokens from "../config/discordTokens";
import cacheController from "../controllers/CacheController";
import messages from "../messages.json";

export const onMessage = async (message: Message, data: Data) => {
    try {
        if (message.channelId == discordTokens.ScoreboardChannel) {
            if (message.attachments.size < 1) {
                await message.delete();
            }
        } else if (message.content == "!no") {
            const guild = await message.client.guilds.fetch(discordTokens.GuildID);
            const member = await guild.members.fetch(message.member!.id);
            for (let role of member.roles.cache.values()) {
                if (discordTokens.Moderators.includes(role.id)) {
                    await message.reply(messages.NO);
                    break;
                }
            }
        } else if (message.content.slice(0,2) == "!r" && message.channelId == discordTokens.QueueChannel) {
            const args = message.content.split(" ");
            const dbUser = await cacheController.getUserByUser(message.member!);
            if (args[1]) {
                let time: number | null = null;
                try {
                    time = Number(args[1]);
                } catch {}
                if (time) {
                    time = Number(Math.max(Math.min(time, 120), 5).toFixed(0));

                    const res = await data.getQueue().addUser(dbUser, time);
                    if (res.success) {
                        await message.reply({content: `You have been readied for ${time} minutes`});
                    } else {
                        await message.reply({content: res.message});
                    }
                } else {
                    await message.reply({content: "Please enter a valid integer"})
                }
            } else {
                const res = await data.getQueue().addUser(dbUser, 30);
                if (res.success) {
                    await message.reply({content: `You have been readied for 30 minutes`});
                } else {
                    await message.reply({content: res.message});
                }
            }
        }
    } catch (e) {
        await logWarn("Message could not be processed", message.client);
    }
}