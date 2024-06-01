import {EmbedBuilder} from "discord.js";
import {GameController} from "../controllers/GameController";
import {GameUser} from "../interfaces/Internal";
import {MapManager} from "../utility/match.util";
import {GameInt} from "../database/models/GameModel";


export const matchFinalEmbed = (game: GameInt, users: GameUser[], mapManager: MapManager) => {
    const embed = new EmbedBuilder();

    embed.setTitle(`Match ${game.matchId} ${game.map.toUpperCase()}`);
    if (game.winner == 0) {
        embed.setDescription(`Team A wins against Team B ${game.scoreA}-${game.scoreB}`);
    } else if (game.winner == 1) {
        embed.setDescription(`Team B wins against Team A ${game.scoreB}-${game.scoreA}`);
    } else {
        embed.setDescription(`Team A and B draw ${game.scoreA}-${game.scoreB}`);
    }

    let teamA = '';
    let teamB = '';

    for (let user of users) {
        if (user.team == 0) {
            teamA += `<@${user.discordMember.id}>\n`;
        } else {
            teamB += `<@${user.discordMember.id}>\n`;
        }
    }

    embed.setFields([
        {
            name: `Team A: ${game.sides[0]}`,
            value: teamA,
            inline: true,
        },
        {
            name: `Team B: ${game.sides[1]}`,
            value: teamB,
            inline: true,
        },
    ]);


    embed.setImage(mapManager.getMap(game.map)!.imageURL);

    return embed.toJSON();
}

export const gameEmbed = (game: GameController) => {
    const embed = new EmbedBuilder()
    embed.setTitle(`Match ${game.matchNumber}-${game.getMap()}`);
    embed.setDescription(`Game started <t:${game.startTime}:R>`);
    const teamInfo = game.getEmbedUsers();
    embed.addFields({
        name: teamInfo.titleA,
        value: teamInfo.teamA,
        inline: true,
    }, {
        name: teamInfo.titleB,
        value: teamInfo.teamB,
        inline: true,
    });

    return embed.toJSON();
}

export const matchConfirmEmbed = (scores: number[]) => {
    const embed = new EmbedBuilder()

    embed.setTitle('Accept Scores')
    embed.setDescription('If these score are incorrect resubmit using the buttons on the initial message that is pinned')
    embed.setFields([
        {
            name: 'Team A',
            value: String(scores[0]),
            inline: true ,
        },{
            name: 'Team B',
            value: String(scores[1]),
            inline: true,
        }
    ])

    return embed.toJSON();
}

export const teamsEmbed = async (users: GameUser[], matchNumber: number, queue: string, map: string, sides: string[], mapManager: MapManager) => {
    const embed = new EmbedBuilder()

    let teamA = '';
    let teamB = '';

    for (let user of users) {
        if (user.team == 0) {
            teamA += `<@${user.discordMember.id}>\n`;
        } else {
            teamB += `<@${user.discordMember.id}>\n`;
        }
    }

    embed.setTitle(`${queue.toUpperCase()}-Match-${matchNumber}: ${map.toUpperCase()}`);
    embed.setFields([
        {
            name: `Team A: ${sides[0]}`,
            value: teamA,
            inline: true,
        },
        {
            name: `Team B: ${sides[1]}`,
            value: teamB,
            inline: true,
        },
    ])


    embed.setImage(mapManager.getMap(map)!.imageURL);

    return embed.toJSON();

}