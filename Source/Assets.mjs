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

    const GamesList = await Games.Get(UserID, CreatorTypes.User)

    for (const Game of GamesList) {
        const Passes = await Games.GetPasses(Game.ID)
        Result.UserPasses.push(...Passes)
    }

    const UserItems = await FilterJSON({
        url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=User&creatorTargetId=${UserID}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
        exhaust: true,
        filter: GetMarketInfo,
    })

    Result.UserMerch.push(...UserItems)

    const GroupsList = await Groups.Get(UserID)

    for (const Group of GroupsList) {
        const GroupGames = await Games.Get(Group.ID, CreatorTypes.Group)

        for (const Game of GroupGames) {
            const Passes = await Games.GetPasses(Game.ID)
            Result.GroupPasses.push(...Passes)
        }

        const GroupItems = await FilterJSON({
            url: `https://catalog.roblox.com/v1/search/items?category=11&creatorType=Group&creatorTargetId=${Group.ID}&limit=120&salesTypeFilter=1&sortOrder=Asc`,
            exhaust: true,
            filter: GetMarketInfo,
        })

        Result.GroupMerch.push(...GroupItems)
    }

    return Result
}

export default Assets
