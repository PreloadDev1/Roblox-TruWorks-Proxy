import Followers from "./Followers.mjs"
import Friends from "./Friends.mjs"
import Games, { CreatorTypes } from "./Games.mjs"
import Groups from "./Groups.mjs"
import Assets from "./Assets.mjs"
import Badges from "./Badges.mjs"

function ParseDate(DateString) {
    const DateObject = new Date(DateString)
    return {
        Year: DateObject.getUTCFullYear(),
        Month: DateObject.getUTCMonth() + 1,
        Day: DateObject.getUTCDate(),
        Hour: DateObject.getUTCHours(),
        Minute: DateObject.getUTCMinutes(),
        Second: DateObject.getUTCSeconds(),
        Millisecond: DateObject.getUTCMilliseconds(),
    }
}

const Profile = {}

Profile.GetProfileData = async function(UserID) {
    const ProfileResponse = await fetch(`https://users.roblox.com/v1/users/${UserID}`)
    if (!ProfileResponse.ok) return null

    const ProfileData = await ProfileResponse.json()

    const GamesList = await Games.GetDetailedList(UserID, CreatorTypes.User)
    const GroupsList = await Groups.GetDetailedList(UserID)
    const FollowerInfo = await Followers.GetFollowers(UserID)
    const FriendInfo = await Friends.GetFriends(UserID)
    const PublicAssets = await Assets.GetPublicAssets(UserID)
    const BadgeInfo = await Badges.GetBadgeInfo(UserID)

    let ActivePlayers = 0
    let Favourites = 0
    let Likes = 0
    let Dislikes = 0
    let Visits = 0
    let GroupMembers = 0

    for (const Game of GamesList) {
        ActivePlayers += Game.ActivePlayers
        Favourites += Game.Favourites
        Visits += Game.Visits
    }

    for (const Group of GroupsList) {
        ActivePlayers += Group.ActivePlayers
        Favourites += Group.Favourites
        Likes += Group.Likes
        Dislikes += Group.Dislikes
        Visits += Group.Visits
        GroupMembers += Group.Members
    }

    return {
        UserID: ProfileData.id,
        Username: ProfileData.name,
        DisplayName: ProfileData.displayName,
        Description: ProfileData.description || "",
        IsBanned: false,
        IsVerified: ProfileData.hasVerifiedBadge || false,
        Created: ParseDate(ProfileData.created),
        Games: GamesList,
        Groups: GroupsList,
        GroupMembers: GroupMembers,
        ActivePlayers: ActivePlayers,
        Favourites: Favourites,
        Likes: Likes,
        Dislikes: Dislikes,
        Visits: Visits,
        Followers: FollowerInfo.Followers,
        FollowerCount: FollowerInfo.FollowerCount,
        Friends: FriendInfo.Friends,
        FriendCount: FriendInfo.FriendCount,
        PublicAssets: PublicAssets,
        Badges: BadgeInfo.Badges,
        BadgeCount: BadgeInfo.BadgeCount,
    }
}

export default Profile
