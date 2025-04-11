import Groups from "./groups.mjs"
import Games, { CreatorTypes } from "./games.mjs"
import Users from "./users.mjs"

async function getPublicAssets(userId) {
	const games = await Games.get(userId, CreatorTypes.User)
	const groups = await Groups.get(userId)
	const userStoreAssets = await Users.getStoreAssets(userId)

	let result = {
		UserPasses: [],   // Formerly gamePasses
		UserMerch: userStoreAssets || [],

		GroupPasses: [],
		GroupMerch: [],
	}

	// Get gamepasses from personal games
	for (const game of games) {
		const gamePasses = await Games.getPasses(game.id)
		result.UserPasses.push(...gamePasses)
	}

	// For each group the user owns
	for (const group of groups) {
   	 const groupGames = await Games.get(group.id, CreatorTypes.Group)
   	 const storeAssets = await Groups.getStoreAssets(group.id) || []

 	   for (const game of groupGames) {
  	      const gamePasses = await Games.getPasses(game.id)
   	     result.GroupPasses.push(...gamePasses)
   	 }

    result.GroupMerch.push(...storeAssets)
}

	return result
}

export default getPublicAssets
