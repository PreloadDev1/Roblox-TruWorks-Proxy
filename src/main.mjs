import Groups from "./groups.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

async function getPublicAssets(userId) {
	const result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: [],
	};

	try {
		// Get personal games, groups owned, and user-created merch
		const games = await Games.get(userId, CreatorTypes.User);
		const groups = await Groups.get(userId);
		const userStoreAssets = await Users.getStoreAssets(userId, CreatorTypes.User, userId);

		if (Array.isArray(userStoreAssets)) {
			result.UserMerch.push(...userStoreAssets);
		}

		// Fetch user-owned gamepasses
		for (const game of games) {
			const passes = await Games.getPasses(game.UniverseID, CreatorTypes.User, userId);
			if (Array.isArray(passes)) {
				result.UserPasses.push(...passes);
			}
		}

		// Fetch group-owned passes and merch
		for (const group of groups) {
			const groupId = group.ID;

			const groupGames = await Games.get(groupId, CreatorTypes.Group);
			const groupAssets = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId);

			if (Array.isArray(groupAssets)) {
				result.GroupMerch.push(...groupAssets);
			}

			for (const game of groupGames) {
				const passes = await Games.getPasses(game.UniverseID, CreatorTypes.Group, groupId);
				if (Array.isArray(passes)) {
					result.GroupPasses.push(...passes);
				}
			}
		}
	} catch (err) {
		console.error("Error in getPublicAssets:", err);
	}

	return result;
}

export default getPublicAssets;
