import FilterJSON, { GetMarketInfo, GetIdentificationInfo } from "./FilterJson.mjs"
import Games, { CreatorTypes } from "./Games.mjs"

const Groups = {}

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

Groups.Get = async function(UserID) {
    const GroupsList = await FilterJSON({
        url: `https://groups.roblox.com/v1/users/${UserID}/groups/roles?includeLocked=false&includeNotificationPreferences=false`,
        exhaust: false,
        filter: Entry => {
            const Group = Entry.group
            if (Group.owner.userId != UserID) return
            return GetIdentificationInfo(Group)
        },
    })

    return GroupsList
}

Groups.GetStoreAssets = async function(GroupID) {
    const StoreAssets = await FilterJSON({
        url: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${GroupID}&CreatorType=2&Limit=30`,
        exhaust: true,
        filter: GetMarketInfo,
    })

    return StoreAssets
}

Groups.GetDetailedList = async function(UserID) {
    const OwnedGroups = await Groups.Get(UserID)
    const Result = []

    for (const Group of OwnedGroups) {
        const InfoResponse = await fetch(`https://groups.roblox.com/v1/groups/${Group.ID}`)
        const Info = InfoResponse.ok ? await InfoResponse.json() : null
        if (!Info) continue

        const GamesList = await Games.GetDetailedList(Group.ID, CreatorTypes.Group)
        const Passes = []
        const Merch = await Groups.GetStoreAssets(Group.ID)

        let ActivePlayers = 0
        let Favourites = 0
        let Likes = 0
        let Dislikes = 0
        let Visits = 0

        for (const Game of GamesList) {
            const GamePasses = await Games.GetPasses(Game.UniverseID)
            Game.Passes = GamePasses
            Passes.push(...GamePasses)
            ActivePlayers += Game.ActivePlayers
            Favourites += Game.Favourites
            Visits += Game.Visits
        }

        Result.push({
            ID: Info.id,
            Name: Info.name,
            OwnerID: Info.owner?.userId || 0,
            OwnerName: Info.owner?.username || "",
            Members: Info.memberCount,
            Created: ParseDate(Info.created),
            Funds: Info.funds || 0,
            Games: GamesList,
            Passes: Passes,
            Merch: Merch,
            ActivePlayers: ActivePlayers,
            Favourites: Favourites,
            Likes: Likes,
            Dislikes: Dislikes,
            Visits: Visits,
        })
    }

    return Result
}

export default Groups
