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
		// Get user games, groups, and merch
		const games = await Games.get(userId, CreatorTypes.User);
		const groups = await Groups.get(userId);
		const userStoreAssets = await Users.getStoreAssets(userId, CreatorTypes.User, userId);

		if (Array.isArray(userStoreAssets)) {
			result.UserMerch.push(...userStoreAssets);
		}

		// User-owned passes
		for (const game of games) {
			if (!game.UniverseID) {
				console.warn("Missing UniverseID on user game:", game);
				continue;
			}
			const passes = await Games.getPasses(game.UniverseID, CreatorTypes.User, userId);
			if (Array.isArray(passes)) {
				result.UserPasses.push(...passes);
			}
		}

		// Group-owned games and assets
		for (const group of groups) {
			const groupId = group.ID;

			console.log("Checking group:", group.Name, groupId);

			const groupGames = await Games.get(groupId, CreatorTypes.Group);
			const groupAssets = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId);

			if (Array.isArray(groupAssets)) {
				result.GroupMerch.push(...groupAssets);
			}

			console.log("Group games:", groupGames.map(g => g.Name));

			for (const game of groupGames) {
				if (!game.UniverseID) {
					console.warn("Missing UniverseID on group game:", game);
					continue;
				}
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
