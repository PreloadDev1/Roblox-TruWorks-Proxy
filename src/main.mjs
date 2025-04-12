import Groups from "./groups.mjs"
import Games, { CreatorTypes } from "./games.mjs"
import Users from "./users.mjs"

async function getPublicAssets(userId) {
    const games = await Games.get(userId, CreatorTypes.User)
    const groups = await Groups.get(userId)
    const userStoreAssets = await Users.getStoreAssets(userId, "User", userId)

    let result = {
        UserPasses: [],
        UserMerch: Array.isArray(userStoreAssets) ? userStoreAssets : [],

        GroupPasses: [],
        GroupMerch: [],
    }

    // Get gamepasses from personal games
    for (const game of games || []) {
        try {
            const gamePasses = await Games.getPasses(game.id, "User", userId)
            if (Array.isArray(gamePasses)) {
                result.UserPasses.push(...gamePasses)
            }
        } catch (err) {
            console.warn(`Failed to fetch user passes for game ${game.id}`, err)
        }
    }

    // For each group the user owns
    for (const group of groups || []) {
        try {
            const groupGames = await Games.get(group.id, CreatorTypes.Group)
            const storeAssets = await Groups.getStoreAssets(group.id, "Group", group.id)

            if (Array.isArray(storeAssets)) {
                result.GroupMerch.push(...storeAssets)
            }

            for (const game of groupGames || []) {
                const groupGamePasses = await Games.getPasses(game.id, "Group", group.id)
                if (Array.isArray(groupGamePasses)) {
                    result.GroupPasses.push(...groupGamePasses)
                }
            }
        } catch (err) {
            console.warn(`Failed to fetch data for group ${group.id}`, err)
        }
    }

    return result
}

export default getPublicAssets
