import FilterJSON, { GetMarketInfo, GetIdentificationInfo } from "./FilterJson.mjs"

const Games = {}

const CreatorTypes = {
    User: "User",
    Group: "Group",
}

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

Games.Get = async function(CreatorID, CreatorType) {
    const CreatorTypeUris = {
        [CreatorTypes.User]: "users",
        [CreatorTypes.Group]: "groups",
    }

    const CreatorTypeUri = CreatorTypeUris[CreatorType]
    if (!CreatorTypeUri) throw new Error("Unknown creator type.")

    const GamesList = await FilterJSON({
        url: `https://games.roblox.com/v2/${CreatorTypeUri}/${CreatorID}/games?accessFilter=2&limit=50&sortOrder=Asc`,
        exhaust: true,
        filter: GetIdentificationInfo,
    })

    return GamesList
}

Games.GetDetailedList = async function(CreatorID, CreatorType) {
    const CreatorTypeUris = {
        [CreatorTypes.User]: "users",
        [CreatorTypes.Group]: "groups",
    }

    const CreatorTypeUri = CreatorTypeUris[CreatorType]
    if (!CreatorTypeUri) throw new Error("Unknown creator type.")

    const GamesList = await FilterJSON({
        url: `https://games.roblox.com/v2/${CreatorTypeUri}/${CreatorID}/games?accessFilter=2&limit=50&sortOrder=Asc`,
        exhaust: true,
        filter: Game => ({
            ActivePlayers: Game.playing,
            AllowedGearCategories: [],
            AllowedGearGenres: [],
            AvatarType: "MorphToR15",
            CopyingAllowed: Game.copyingAllowed,
            CreateVipServersAllowed: Game.createVipServersAllowed,
            Created: ParseDate(Game.created),
            Updated: ParseDate(Game.updated),
            Creator: {
                ID: Game.creator.id,
                Name: Game.creator.name,
                Type: Game.creator.type,
            },
            Description: Game.description || "",
            Favourites: Game.favoritedCount,
            Genre1: Game.genre,
            Genre2: "",
            Genre3: "",
            Name: Game.name,
            Passes: [],
            PlaceID: Game.rootPlaceId,
            ServerSize: Game.maxPlayers,
            SourcedName: Game.name,
            Thumbnail: Game.thumbnailUrl || "",
            UniverseID: Game.id,
            Visits: Game.visits,
        }),
    })

    return GamesList
}

Games.GetByUniverseId = async function(UniverseID) {
    const Response = await fetch(`https://games.roblox.com/v1/games?universeIds=${UniverseID}`)
    if (!Response.ok) return null

    const Body = await Response.json()
    const Game = Body.data[0]
    if (!Game) return null

    return {
        ID: Game.id,
        Name: Game.name,
    }
}

Games.GetPasses = async function(UniverseID) {
    const Passes = await FilterJSON({
        url: `https://games.roblox.com/v1/games/${UniverseID}/game-passes?limit=10&sortOrder=1`,
        exhaust: true,
        filter: GetMarketInfo,
    })

    return Passes
}

export default Games
export { CreatorTypes }
