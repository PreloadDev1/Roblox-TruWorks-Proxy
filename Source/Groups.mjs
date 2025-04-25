import filterJSON, { getMarketInfo } from "./FilterJson.mjs"
import Games, { CreatorTypes } from "./Games.mjs"

const Groups = {}

function parseDate(DateString) {
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

Groups.get = async function(UserID) {
    const GroupsList = await filterJSON({
        url: `https://groups.roblox.com/v2/users/${UserID}/groups/roles`,
        exhaust: true,
        filter: entry => {
            if (entry.role.rank === 255) {
                return {
                    ID: entry.group.id,
                    Name: entry.group.name,
                }
            }
        },
    })

    return GroupsList
}

Groups.getStoreAssets = async function(GroupID) {
    const Assets = await filterJSON({
        url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=Group&creatorTargetId=${GroupID}&limit=30&salesTypeFilter=1&sortOrder=Asc`,
        exhaust: true,
        filter: getMarketInfo,
    })

    return Assets
}

Groups.getDetailedList = async function(UserID) {
    const OwnedGroups = await Groups.get(UserID)
    const Result = []

    for (const Group of OwnedGroups) {
        const InfoResponse = await fetch(`https://groups.roblox.com/v1/groups/${Group.ID}`)
        const Info = InfoResponse.ok ? await InfoResponse.json() : null
        if (!Info) continue

        const GamesList = await Games.getDetailedList(Group.ID, CreatorTypes.Group)
        const Passes = []
        const Merch = await Groups.getStoreAssets(Group.ID)

        let ActivePlayers = 0
        let Favourites = 0
        let Likes = 0
        let Dislikes = 0
        let Visits = 0

        for (const Game of GamesList) {
            const GamePasses = await Games.getPasses(Game.UniverseID)
            Game.Passes = GamePasses
            Passes.push(...GamePasses)
            ActivePlayers += Game.ActivePlayers
            Favourites += Game.Favourites
            Likes += 0
            Dislikes += 0
            Visits += Game.Visits
        }

        Result.push({
            ID: Info.id,
            Name: Info.name,
            OwnerID: Info.owner?.userId || 0,
            Owner: Info.owner?.username || "",
            Members: Info.memberCount,
            Created: parseDate(Info.created),
            Funds: 0,
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
