import filterJSON, { getMarketInfo, getIndentificationInfo } from "./filterjson.mjs"
import Groups from "./groups.mjs"
import Games, { CreatorTypes } from "./games.mjs"

const Profile = {}

Profile.getBasicInfo = async function (userId) {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`)
    if (!response.ok) throw new Error("Failed to get profile info")
    const data = await response.json()
    return data
}

Profile.getFollowersCount = async function (userId) {
    const response = await fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`)
    if (!response.ok) return 0
    const data = await response.json()
    return data.count || 0
}

Profile.getFollowings = async function (userId) {
    const results = await filterJSON({
        url: `https://friends.roblox.com/v1/users/${userId}/followings?limit=100`,
        exhaust: true,
        filter: getIndentificationInfo
    })
    return results
}

Profile.getFavoriteCounts = async function (universeId) {
    const response = await fetch(`https://games.roblox.com/v1/games/${universeId}/votes`)
    if (!response.ok) return { favorites: 0 }
    const data = await response.json()
    return { favorites: data.favoritedCount || 0 }
}

Profile.getPublicAssets = async function (userId) {
    const games = await Games.get(userId, CreatorTypes.User)
    const groups = await Groups.get(userId)

    let result = {
        userId,
        username: null,
        displayName: null,
        description: null,
        isBanned: false,
        created: null,
        followers: 0,
        following: [],
        gamePasses: [],
        groupGamePasses: [],
        groupStoreAssets: [],
        games: [],
    }

    const basicInfo = await Profile.getBasicInfo(userId)
    const followerCount = await Profile.getFollowersCount(userId)
    const followings = await Profile.getFollowings(userId)

    Object.assign(result, basicInfo)
    result.followers = followerCount
    result.following = followings

    for (const game of games) {
        const gamePasses = await Games.getPasses(game.id)
        const favoriteInfo = await Profile.getFavoriteCounts(game.id)
        game.favorites = favoriteInfo.favorites

        result.games.push(game)
        result.gamePasses.push(...gamePasses)
    }

    for (const group of groups) {
        const groupGames = await Games.get(group.id, CreatorTypes.Group)
        const storeAssets = await Groups.getStoreAssets(group.id)

        for (const game of groupGames) {
            const gamePasses = await Games.getPasses(game.id)
            const favoriteInfo = await Profile.getFavoriteCounts(game.id)
            game.favorites = favoriteInfo.favorites

            result.groupGamePasses.push(...gamePasses)
            result.games.push(game)
        }

        result.groupStoreAssets.push(...storeAssets)
    }

    return result
}

export default Profile
