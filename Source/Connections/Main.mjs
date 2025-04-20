// src/routes/main.mjs

import Groups from "../services/groups.mjs"; // ✅ FIXED path
import Games, { CreatorTypes } from "../services/games.mjs"; // ✅ FIXED path
import Users from "../services/users.mjs"; // ✅ FIXED path


async function getPublicAssets(userId) {
	const result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: [],
	}

	try {
		// 🧠 Fetch personal games
		const userGames = await Games.get(userId, CreatorTypes.User)
		console.log(`[UserGames] ${userGames.length} games found`)

		for (const game of userGames) {
			if (!game.UniverseID) continue
			const passes = await Games.getPasses(game.UniverseID, CreatorTypes.User, userId)
			if (Array.isArray(passes)) {
				result.UserPasses.push(...passes)
			}
		}

		// 🧠 Fetch user-owned items
		const userItems = await Users.getStoreAssets(userId, CreatorTypes.User, userId)
		if (Array.isArray(userItems)) {
			result.UserMerch.push(...userItems)
		}

		// 🧠 Fetch groups
		const groups = await Groups.get(userId)
		console.log(`[UserGroups] ${groups.length} groups found`)

		for (const group of groups) {
			const groupId = group.ID
			if (!groupId) continue

			// 🔹 Group-owned items
			const groupItems = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId)
			if (Array.isArray(groupItems)) {
				result.GroupMerch.push(...groupItems)
			}

			// 🔹 Group-owned games → passes
			const groupGames = await Games.get(groupId, CreatorTypes.Group)
			for (const game of groupGames) {
				if (!game.UniverseID) continue
				const passes = await Games.getPasses(game.UniverseID, CreatorTypes.Group, groupId)
				if (Array.isArray(passes)) {
					result.GroupPasses.push(...passes)
				}
			}
		}
	} catch (err) {
		console.error("[TruWorks:getPublicAssets] Error:", err)
	}

	return result
}

export default getPublicAssets
