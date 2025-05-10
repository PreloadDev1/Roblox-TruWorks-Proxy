import Groups from "./Groups.mjs"
import Games, { CreatorTypes } from "./Games.mjs"
import FilterJSON, { GetMarketInfo } from "./FilterJson.mjs"

const Assets = {}

Assets.GetPublicAssets = async function(UserID) {
    const Result = {
        UserPasses: [],
        GroupPasses: [],
        UserMerch: [],
        GroupMerch: [],
    }

    const GamesList = await Games.get(UserID, CreatorTypes.User)

    for (const Game of GamesList) {
        const Passes = await Games.getPasses(Game.id)
        Result.UserPasses.push(...Passes)
    }

    const UserItems = await FilterJSON({
        url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=User&creatorTargetId=${UserID}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
        exhaust: true,
        filter: GetMarketInfo,
    })

    Result.UserMerch.push(...UserItems)

    const GroupsList = await Groups.get(UserID)

    for (const Group of GroupsList) {
        const GroupGames = await Games.get(Group.id, CreatorTypes.Group)

        for (const Game of GroupGames) {
            const Passes = await Games.getPasses(Game.id)
            Result.GroupPasses.push(...Passes)
        }

        const GroupItems = await FilterJSON({
            url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=Group&creatorTargetId=${Group.id}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
            exhaust: true,
            filter: GetMarketInfo,
        })

        Result.GroupMerch.push(...GroupItems)
    }

    return Result
}

export default Assets
