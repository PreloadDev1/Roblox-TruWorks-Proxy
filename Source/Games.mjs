import FilterJSON from "./FilterJson.mjs"

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
        url: `https://games.roblox.com/v2/${CreatorTypeUri}/${CreatorID}/games?accessFilter=2&limit=100&sortOrder=Asc`,
        exhaust: true,
        filter: Game => ({
            ID: Game.id,
            Name: Game.name,
        }),
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
        url: `https://games.roblox.com/v2/${CreatorTypeUri}/${CreatorID}/games?accessFilter=2&limit=100&sortOrder=Asc`,
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
    const RawPasses = await FilterJSON({
        url: `https://games.roblox.com/v1/games/${UniverseID}/game-passes?limit=100&sortOrder=Asc`,
        exhaust: true,
        filter: Item => Item,
    })

    const IDs = RawPasses.map(P => P.id).join(",")
    if (!IDs) return []

    const InfoResponse = await fetch(`https://catalog.roblox.com/v1/catalog/items/details?itemIds=${IDs}`)
    const InfoData = InfoResponse.ok ? await InfoResponse.json() : { data: [] }

    const ThumbnailsResponse = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${IDs}&format=Png&size=150x150`)
    const ThumbnailsData = ThumbnailsResponse.ok ? await ThumbnailsResponse.json() : { data: [] }

    const Passes = RawPasses.map(Item => {
        const Info = InfoData.data.find(I => I.id === Item.id) || {}
        const Thumbnail = ThumbnailsData.data.find(T => T.assetId === Item.id)

        return {
            ID: Item.id,
            Name: Item.name,
            Price: Item.price ?? 0,
            Description: Info.description || "",
            Thumbnail: Thumbnail?.imageUrl || "",
        }
    })

    return Passes
}

export default Games
export { CreatorTypes }
