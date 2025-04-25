import filterJSON from "./FilterJson.mjs"

const Games = {}

const CreatorTypes = {
    User: "User",
    Group: "Group",
}

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

Games.get = async function(CreatorID, CreatorType) {
    const CreatorTypeUris = {
        [CreatorTypes.User]: "users",
        [CreatorTypes.Group]: "groups",
    }

    const CreatorTypeUri = CreatorTypeUris[CreatorType]
    if (!CreatorTypeUri) {
        throw new Error("Unknown creator type.")
    }

    const GamesList = await filterJSON({
        url: `https://games.roblox.com/v2/${CreatorTypeUri}/${CreatorID}/games?accessFilter=2&limit=50&sortOrder=Asc`,
        exhaust: true,
        filter: game => {
            return {
                ID: game.id,
                Name: game.name,
            }
        },
    })

    return GamesList
}

Games.getDetailedList = async function(CreatorID, CreatorType) {
    const CreatorTypeUris = {
        [CreatorTypes.User]: "users",
        [CreatorTypes.Group]: "groups",
    }

    const CreatorTypeUri = CreatorTypeUris[CreatorType]
    if (!CreatorTypeUri) {
        throw new Error("Unknown creator type.")
    }

    const GamesList = await filterJSON({
        url: `https://games.roblox.com/v2/${CreatorTypeUri}/${CreatorID}/games?accessFilter=2&limit=50&sortOrder=Asc`,
        exhaust: true,
        filter: game => {
            return {
                ActivePlayers: game.playing,
                AllowedGearCategories: [],
                AllowedGearGenres: [],
                AvatarType: "MorphToR15",
                CopyingAllowed: game.copyingAllowed,
                CreateVipServersAllowed: game.createVipServersAllowed,
                Created: parseDate(game.created),
                Updated: parseDate(game.updated),
                Creator: {
                    ID: game.creator.id,
                    Name: game.creator.name,
                    Type: game.creator.type,
                },
                Description: game.description || "",
                Favourites: game.favoritedCount,
                Genre1: game.genre,
                Genre2: "",
                Genre3: "",
                Name: game.name,
                Passes: [],
                PlaceID: game.rootPlaceId,
                ServerSize: game.maxPlayers,
                SourcedName: game.name,
                Thumbnail: game.thumbnailUrl || "",
                UniverseID: game.id,
                Visits: game.visits,
            }
        },
    })

    return GamesList
}

Games.getByUniverseId = async function(UniverseID) {
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

Games.getPasses = async function(UniverseID) {
    const RawPasses = await filterJSON({
        url: `https://games.roblox.com/v1/games/${UniverseID}/game-passes?limit=10&sortOrder=Asc`,
        exhaust: true,
        filter: item => item,
    })

    const IDs = RawPasses.map(p => p.id).join(",")
    const InfoResponse = await fetch(`https://catalog.roblox.com/v1/catalog/items/details?itemIds=${IDs}`)
    const InfoData = InfoResponse.ok ? await InfoResponse.json() : { data: [] }

    const ThumbnailsResponse = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${IDs}&format=Png&size=150x150`)
    const ThumbnailsData = ThumbnailsResponse.ok ? await ThumbnailsResponse.json() : { data: [] }

    const Passes = RawPasses.map(item => {
        const Info = InfoData.data.find(i => i.id === item.id) || {}
        const Thumbnail = ThumbnailsData.data.find(t => t.assetId === item.id)

        return {
            ID: item.id,
            Name: item.name,
            Price: item.price ?? 0,
            Description: Info.description || "",
            Thumbnail: Thumbnail?.imageUrl || "",
        }
    })

    return Passes
}

export default Games
export { CreatorTypes }
