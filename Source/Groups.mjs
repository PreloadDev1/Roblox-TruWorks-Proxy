import FilterJSON, { GetMarketInfo } from "./FilterJson.mjs"
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
        url: `https://groups.roblox.com/v2/users/${UserID}/groups/roles`,
        exhaust: true,
        filter: Entry => {
            if (Entry.role.rank === 255) {
                return {
                    ID: Entry.group.id,
                    Name: Entry.group.name,
                }
            }
        },
    })

    return GroupsList
}

Groups.GetStoreAssets = async function(GroupID) {
    const Assets = await FilterJSON({
        url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=Group&creatorTargetId=${GroupID}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
        exhaust: true,
        filter: GetMarketInfo,
    })

    return Assets
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
