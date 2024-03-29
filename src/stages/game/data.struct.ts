export const VoteData = {
    bannedMaps: [],
    teamAChannelID: "",
    teamAVoteID: "",
    teamBChannelID: "",
    teamBVoteID: "",
    create: function (bannedMaps: string[], teamAChannelID: string, teamAVoteID: string, teamBChannelID: string, teamBVoteID: string) {
        const newVoteData = Object.create(this);
        newVoteData.bannedMaps = bannedMaps;
        this.teamAChannelID = teamAChannelID;
        this.teamAVoteID = teamAVoteID;
        this.teamBChannelID = teamAChannelID;
        this.teamBVoteID = teamBVoteID;
        return newVoteData;
    }
}