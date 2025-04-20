// src/routes/groups.mjs

import filterJSON from "../utils/filterjson.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

// Helper to format ISO dates into objects
function parseDateParts(dateString) {
	if (!dateString) return null;
	const date = new Date(dateString);
	return {
		Year: date.getUTCFullYear(),
		Month: date.getUTCMonth() + 1,
		Day: date.getUTCDate(),
		Hour: date.getUTCHours(),
		Minute: date.getUTCMinutes(),
		Second: date.getUTCSeconds(),
		Millisecond: date.getUTCMilliseconds(),
	};
}

const Groups = {};

// Get groups owned by the user with full structure
Groups.get = async function (userId) {
	const groups = await filterJSON({
		url: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false`,
		exhaust: false,
		filter: async function (row) {
			const group = row.group;
			if (!group || !row.role || row.role.rank !== 255) return null;

			const groupId = group.id;

			// Get detailed group info
			const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
			if (!res.ok) return null;
			const info = await res.json();

			// Get group games
			const games = await Games.get(groupId, CreatorTypes.Group);
			const favorites = games.reduce((sum, g) => sum + (g.Favorites || 0), 0);
			const activePlayers = games.reduce((sum, g) => sum + (g.Active || 0), 0);

			// Get game passes
			const allPasses = (await Promise.all(
				games.map(game => Games.getPasses(game.UniverseID, CreatorTypes.Group, groupId))
			)).flat();

			// Get merch
			const merch = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId);

			return {
				OwnerID: userId,
				ID: groupId,
				Name: group.name,
				OwnerName: info.owner?.username || null,
				Created: parseDateParts(info.created),
				Members: info.memberCount || 0,
				Games: games,
				ActivePlayers: activePlayers,
				Favourites: favorites,
				GamePasses: allPasses,
				Merch: merch || []
			};
		}
	});

	return groups;
};

// src/routes/groups.mjs (continued)

Groups.getStoreAssets = async function (groupId) {
	const storeAssets = await filterJSON({
		url: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${groupId}&CreatorType=2&Limit=30&SortType=3`,
		exhaust: true,
		filter: async function (item) {
			return {
				ID: item.id,
				Name: item.name,
				Price: item.price,
				CreatorID: groupId,
				CreatorType: "Groups",
				Thumbnail: item.thumbnail?.imageUrl || null
			};
		}
	});

	return storeAssets;
};


export default Groups;
