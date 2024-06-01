import {APIEmbed, EmbedBuilder} from "discord.js";
import {StatsInt} from "../database/models/StatsModel";
import {UserInt} from "../database/models/UserModel";
import {getRank} from "../utility/rank.util";
import discordTokens from "../config/discordTokens";
import {GameData} from "../interfaces/Internal";

export const queueInfoEmbeds = (queueData: {inQueue: string[], games: GameData[]}): APIEmbed[] => {
    let embeds: APIEmbed[] = [];
    let games: APIEmbed[] = [];
    const initialEmbed = new EmbedBuilder()
        .setTitle("Queue")
        .setDescription(`Active Games: ${queueData.games.length}\nPlayers in Queue: ${queueData.inQueue.length}`);
    let gamesStr = '';
    for (let game of queueData.games) {
        const embed = new EmbedBuilder()
            .setTitle(`Match number ${game.matchNumber}`)
            .setDescription(`State: ${game.state}\nTick count: ${game.tickCount}\n
                \nNumber in game: ${game.users.length}`);
        let usersStr = '';
        for (let user of game.users) {
            usersStr += user + "\n";
        }
        gamesStr += `${game.matchNumber}\n`;
        embed.addFields({
            name: "Players",
            value: usersStr,
            inline: false,
        });
        games.push(embed.toJSON());
    }
    initialEmbed.addFields({
        name: 'Games',
        value: (gamesStr == '') ? 'none' : gamesStr,
        inline: false,
    });
    embeds.push(initialEmbed.toJSON());
    for (let embed of games) {
        embeds.push(embed);
    }

    return embeds;
}

export const statsEmbed = (stats: StatsInt, user: UserInt, name: string, imageURL: string): APIEmbed => {
    const embed = new EmbedBuilder();

    if (stats.gamesPlayed >= 10) {
        embed.setTitle(`${name}'s Stats - [${stats.rank}]`);
        embed.setDescription(`${getRank(stats.mmr).name}-${stats.mmr.toFixed(1)} MMR\nGames played - ${stats.gamesPlayed}\n
        `);
        //[Website Stats](https://shackmm.com/players/${user._id}/stats)`
    } else {
        embed.setTitle(`${name}'s Stats`);
        if (stats.gamesPlayed == 9) {
            embed.setDescription(`Play 1 more game to get ranked\nGames played - ${stats.gamesPlayed}`);
        } else {
            embed.setDescription(`Play ${10 - stats.gamesPlayed} more games to get ranked\nGames played - ${stats.gamesPlayed}`);
        }

    }

    embed.setThumbnail(imageURL);

    let history = ""
    let games;
    if (stats.gameHistory.length < 10) {
        games = stats.gameHistory.slice(-stats.gameHistory.length);
    } else {
        games = stats.gameHistory.slice(-10)
    }


    for (let game of games) {
        if (game == 'win') {
            history += (discordTokens.Emoji.Win);
        } else if (game == 'loss') {
            history += (discordTokens.Emoji.Loss);
        } else {
            history += (discordTokens.Emoji.Draw);
        }
    }

    if (history.length == 0) {
        history = "Play a game to show"
    }


    embed.addFields({
            name: 'Win %',
            value: `${(stats.winRate * 100).toFixed(1)}`,
            inline: true,
        },{
            name: 'Wins',
            value: `${stats.wins}`,
            inline: true,
        },{
            name: 'Losses',
            value: `${stats.losses}`,
            inline: true,
        },{
            name: 'Draws',
            value: `${stats.draws}`,
            inline: true,
        },{
            name: 'History',
            value: history,
            inline: false,
        }
    )

    return embed.toJSON();
}