import Groups from "./groups.mjs"
import Games, { CreatorTypes } from "./games.mjs"
import Users from "./users.mjs"

async function getPublicAssets(userId) {
	const games = await Games.get(userId, CreatorTypes.User)
	const groups = await Groups.get(userId)
	const userStoreAssets = await Users.getStoreAssets(userId, "User", userId)

	let result = {
		UserPasses: [],
		UserMerch: userStoreAssets || [],
		GroupPasses: [],
		GroupMerch: [],
	}

	// Personal gamepasses
	for (const game of games) {
		const gamePasses = await Games.getPasses(game.id, "User", userId)
		result.UserPasses.push(...gamePasses)
	}

	// Group-owned gamepasses and merch
	for (const group of groups) {
		const groupGames = await Games.get(group.id, CreatorTypes.Group)
		const storeAssets = await Groups.getStoreAssets(group.id, "Group", group.id)

		for (const game of groupGames) {
			const gamePasses = await Games.getPasses(game.id, "Group", group.id)
			result.GroupPasses.push(...gamePasses)
		}

		result.GroupMerch.push(...storeAssets)
	}

	return result
}

export default getPublicAssets
