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
		// Get personal games and merch
		const games = await Games.get(userId, CreatorTypes.User);
		console.log("[UserGames]", games.length, "games found");

		const userStoreAssets = await Users.getStoreAssets(userId, CreatorTypes.User, userId);
		if (Array.isArray(userStoreAssets)) {
			result.UserMerch.push(...userStoreAssets);
		}

		for (const game of games) {
			if (!game.UniverseID) {
				console.warn("[WARN] Skipping user game without UniverseID:", game);
				continue;
			}
			const passes = await Games.getPasses(game.UniverseID, CreatorTypes.User, userId);
			if (Array.isArray(passes)) {
				result.UserPasses.push(...passes);
			}
		}

		// Get groups
		const groups = await Groups.get(userId);
		console.log("[UserGroups]", groups.length, "groups found");

		for (const group of groups) {
			const groupId = group.ID;
			console.log(`[Group:${groupId}] Fetching group games...`);

			const groupGames = await Games.get(groupId, CreatorTypes.Group);
			console.log(`[Group:${groupId}]`, groupGames.length, "games found");

			const groupAssets = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId);
			if (Array.isArray(groupAssets)) {
				result.GroupMerch.push(...groupAssets);
			}

			for (const game of groupGames) {
				if (!game.UniverseID) {
					console.warn("[WARN] Skipping group game without UniverseID:", game);
					continue;
				}
				const passes = await Games.getPasses(game.UniverseID, CreatorTypes.Group, groupId);
				if (Array.isArray(passes)) {
					result.GroupPasses.push(...passes);
				}
			}
		}
	} catch (err) {
		console.error("[ERROR] Failed to fetch public assets:", err);
	}

	return result;
}

export default getPublicAssets;
