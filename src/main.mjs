import Groups from "./groups.mjs"
import Games, { CreatorTypes } from "./games.mjs"
import Users from "./users.mjs"

async function getPublicAssets(userId) {
    // Fetch all games and groups owned by the user
    const games = await Games.get(userId, CreatorTypes.User)
    const groups = await Groups.get(userId)

    // Fetch all user store assets (T-Shirts, Shirts, Pants, etc.)
    const userStoreAssets = await Users.getStoreAssets(userId)

    let result = {
        gamePasses: [],
        groupGamePasses: [],
        groupStoreAssets: [],
        userStoreAssets: userStoreAssets || [],
    }

    // Add gamepasses from personal games
    for (const game of games) {
        const gamePasses = await Games.getPasses(game.id)
        result.gamePasses.push(...gamePasses)
    }

    // Add group-owned gamepasses and store assets
    for (const group of groups) {
        const groupGames = await Games.get(group.id, CreatorTypes.Group)
        const storeAssets = await Groups.getStoreAssets(group.id)

        for (const game of groupGames) {
            const gamePasses = await Games.getPasses(game.id)
            result.groupGamePasses.push(...gamePasses)
        }

        result.groupStoreAssets.push(...storeAssets)
    }

    return result
}

// Uncomment to test locally
const result = await getPublicAssets(/* UserId here as a string or number */)
console.log(result)
