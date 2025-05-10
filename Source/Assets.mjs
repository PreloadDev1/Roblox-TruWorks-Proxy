import Groups from "./Groups.mjs"
import Games, { CreatorTypes } from "./Games.mjs"
import FilterJSON, { GetMarketInfo } from "./FilterJson.mjs"

const Assets = {}

async function FetchItemDetails(IDs) {
    if (!IDs.length) return []
    const IDsParam = IDs.join(",")
    const Response = await fetch(`https://catalog.roblox.com/v1/catalog/items/details?itemIds=${IDsParam}`)
    if (!Response.ok) return []
    const Data = await Response.json()
    return Data.data.map(Item => ({
        ID: Item.id,
        Name: Item.name,
        Description: Item.description || "",
        Price: Item.price ?? 0,
        Thumbnail: Item.thumbnailUrl || "",
    }))
}

Assets.GetPublicAssets = async function(UserID) {
    const Result = {
        UserPasses: [],
        GroupPasses: [],
        UserMerch: [],
        GroupMerch: [],
    }

    const GamesList = await Games.Get(UserID, CreatorTypes.User)

    for (const Game of GamesList) {
        const Passes = await Games.GetPasses(Game.ID)
        Result.UserPasses.push(...Passes)
    }

    const RawUserItems = await FilterJSON({
        url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=User&creatorTargetId=${UserID}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
        exhaust: true,
        filter: Item => Item,
    })

    const UserItemIDs = RawUserItems.map(Item => Item.id)
    const UserItems = await FetchItemDetails(UserItemIDs)
    Result.UserMerch.push(...UserItems)

    const GroupsList = await Groups.Get(UserID)

    for (const Group of GroupsList) {
        const GroupGames = await Games.Get(Group.ID, CreatorTypes.Group)

        for (const Game of GroupGames) {
            const Passes = await Games.GetPasses(Game.ID)
            Result.GroupPasses.push(...Passes)
        }

        const RawGroupItems = await FilterJSON({
            url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=Group&creatorTargetId=${Group.ID}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
            exhaust: true,
            filter: Item => Item,
        })

        const GroupItemIDs = RawGroupItems.map(Item => Item.id)
        const GroupItems = await FetchItemDetails(GroupItemIDs)
        Result.GroupMerch.push(...GroupItems)
    }

    return Result
}

export default Assets
