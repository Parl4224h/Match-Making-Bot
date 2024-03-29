import {OverwriteResolvable, PermissionsBitField, Role} from "discord.js";
import discordTokens from "../config/discordTokens";

export const getAcceptPerms = (acceptRole: Role | string): OverwriteResolvable[] => {
    const perms: OverwriteResolvable[] = [];
    perms.push({
        id: (acceptRole instanceof Role) ? acceptRole.id : acceptRole,
        allow: [
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.UseApplicationCommands,
        ],
        type: 0,
    });

    perms.push(modPerms, denyEverybody);

    return perms;
}

export const getMatchPerms = (role: Role | string, vc: boolean): OverwriteResolvable[] => {
    const perms: OverwriteResolvable[] = [];
    perms.push({
        id: (role instanceof Role) ? role.id : role,
        allow: [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.UseApplicationCommands,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.UseVAD,
            PermissionsBitField.Flags.Stream,
            PermissionsBitField.Flags.Speak,
        ],
        type: 0,
    });

    if (vc) {
        perms.push(modPerms, denyVC);
    } else {
        perms.push(modPerms, denyEverybody);
    }



    return perms;
}

export const getStagePerms = (role: Role | string): OverwriteResolvable[] => {
    const perms: OverwriteResolvable[] = [];
    perms.push({
        id: (role instanceof Role) ? role.id : role,
        allow: [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.UseApplicationCommands,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.UseVAD,
            PermissionsBitField.Flags.Stream,
            PermissionsBitField.Flags.Speak,
        ],
        type: 0,
    });
    perms.push(modPerms, stageEveryone, mutedPerms);

    return perms;

}

const stageEveryone: OverwriteResolvable = {
    id: discordTokens.GuildID,
    allow: [
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.ViewChannel,
    ],
    deny: [
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.RequestToSpeak,
    ]
}

const mutedPerms = {
    id: discordTokens.MutedRole,
    deny: [
        PermissionsBitField.Flags.SendMessages,
    ]
}

const denyVC = {
    id: discordTokens.GuildID,
    allow: [
        PermissionsBitField.Flags.ViewChannel,
    ],
    deny: [
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.RequestToSpeak,
    ]
}

const modPerms: OverwriteResolvable = {
    id: discordTokens.ModRole,
    allow: [
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.UseApplicationCommands,
        PermissionsBitField.Flags.ManageMessages,
        PermissionsBitField.Flags.MentionEveryone,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.UseVAD,
        PermissionsBitField.Flags.Stream,
        PermissionsBitField.Flags.MuteMembers,
        PermissionsBitField.Flags.DeafenMembers,
        PermissionsBitField.Flags.MoveMembers,
        PermissionsBitField.Flags.Speak,
        PermissionsBitField.Flags.ManageChannels,
    ],
    type: 0,
}

const denyEverybody: OverwriteResolvable = {
    id: discordTokens.GuildID,
    deny:
        [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.Connect,
        ],
    type: 0,
}
