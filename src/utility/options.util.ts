import {
    SlashCommandBooleanOption,
    SlashCommandIntegerOption, SlashCommandNumberOption,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "discord.js";

export const mapNameOption = new SlashCommandStringOption()
    .setName("map_name")
    .setRequired(true)
    .setDescription("name of map to add");

export const mapResourceIDOption = new SlashCommandStringOption()
    .setName("resource_id")
    .setRequired(true)
    .setDescription("resource ID of map to add");

export const inPoolOption = new SlashCommandBooleanOption()
    .setName("in_pool")
    .setRequired(true)
    .setDescription("whether the map should be in the pool or not");

export const mapURLOption = new SlashCommandStringOption()
    .setName("image_url")
    .setRequired(true)
    .setDescription("URL of map image");

export const calloutOption = new SlashCommandStringOption()
    .setName("callout_map")
    .setRequired(false)
    .setDescription("link to callout map");

export const mapSearchOption = new SlashCommandStringOption()
    .setName('map_name')
    .setDescription('Map name to update')
    .setRequired(true)
    .setAutocomplete(true);

export const games = new SlashCommandIntegerOption()
        .setName('games')
        .setDescription("Number of games to graph defaults to 10 with a min of 10")
        .setRequired(false)
        .setMinValue(10);

export const userOption = (description: string): SlashCommandUserOption => {
    return new SlashCommandUserOption()
        .setName('user')
        .setDescription(description)
        .setRequired(true);
}

export const userOptional = (description: string): SlashCommandUserOption => {
    return new SlashCommandUserOption()
        .setName('user')
        .setDescription(description)
        .setRequired(false);
}

export const pingMeNumber = new SlashCommandIntegerOption()
    .setName("in_queue")
    .setDescription("Number of players in queue to ping at")
    .setRequired(true)
    .setMinValue(4)
    .setMaxValue(9);

export const pingMeExpire = new SlashCommandIntegerOption()
    .setName('expire_time')
    .setDescription("Set how long until your ping me expires. <1 for infinite, 0 to remove, >1 for the time specified")
    .setRequired(true);

export const easyTimeMessage = new SlashCommandStringOption()
    .setName('message')
    .setDescription("Message for the user to see default to @user in x you will be abandoned if you do not join the game")
    .setRequired(false);

export const reason: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('reason')
    .setDescription('Reason the action was taken')
    .setRequired(true);

export const score = (name: string) => {
    return new SlashCommandIntegerOption()
        .setName(name)
        .setDescription('Score to submit')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(10)
}

export const mmrOption: SlashCommandNumberOption = new SlashCommandNumberOption()
    .setName('mmr')
    .setDescription('The MMR to adjust by')
    .setRequired(true);

export const cooldownOption = new SlashCommandStringOption()
    .setName('action_type')
    .setDescription("Action that was deserving of cooldown")
    .setChoices(
        {
            name: "Minor Action",
            value: "0"
        }, {
            name: "Major Action",
            value: "2"
        }, {
            name: "Extenuating Major Action",
            value: "1"
        })
    .setRequired(true);

export const timeScales: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('time_scale')
    .setDescription('The time scale to submit action on')
    .setRequired(true)
    .setChoices({name: 'Minutes', value: 'm'}, {name: 'Hours', value: 'h'}, {name: 'Days', value: 'd'}, {name: 'Weeks', value: 'w'});

export const timeOption: SlashCommandNumberOption = new SlashCommandNumberOption()
    .setName('time')
    .setDescription("Time can be a decimal value")
    .setRequired(true);

export const warnIdOption = new SlashCommandStringOption()
    .setName("id")
    .setDescription("Id of the warning to remove")
    .setRequired(true);

export const cdType: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('type')
    .setDescription("The type of cd to remove or reverse")
    .setRequired(true)
    .setChoices(
        {
            name: "Abandon",
            value: "abandon",
        },{
            name: "Fail to Accept",
            value: "fail",
        }
    )

export const regionOption = new SlashCommandStringOption()
    .setName('region')
    .setDescription("region to set")
    .setRequired(true)
    .setChoices({
            name: "NAE",
            value: "NAE"
        }, {
            name: "NAW",
            value: "NAW"
        }, {
            name: "EUE",
            value: "EUE"
        }, {
            name: "EUW",
            value: "EUW",
        }, {
            name: "APAC",
            value: "APAC"
        }
    );

export const warnReason = new SlashCommandStringOption()
    .setName("reason")
    .setDescription("Reason for the warning")
    .setRequired(true);
