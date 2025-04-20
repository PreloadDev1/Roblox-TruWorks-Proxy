// src/groups.mjs

import filterJSON, { getMarketInfo, getIdentificationInfo } from "./filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";

const Groups = {};

// ✅ Get groups owned by the user
Groups.get = async function (userId) {
	const groups = await filterJSON({
		url: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false&includeNotificationPreferences=false`,
		exhaust: false,
		filter: function (row) {
			const group = row.group;
			if (!group || !group.owner) return;

			const ownerId = Number(group.owner.userId);
			const targetId = Number(userId);

			if (ownerId !== targetId) {
				console.log(`[GroupFetch] Skipping group '${group.name}' (ID ${group.id}) because user ${userId} is not the owner (Owner ID: ${ownerId})`);
				return;
			}

			console.log(`[GroupFetch] Including group '${group.name}' (ID ${group.id}) owned by ${userId}`);
			return {
				ID: group.id,
				Name: group.name,
			};
		},
	});

	console.log(`[UserGroups] ${groups.length} groups found for user ${userId}`);
	return groups;
};

// 📦 Get store items sold by a group
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
				CreatorType: "Group",
				Thumbnail: await getThumbnail(item.id, "Asset"),
			};
		},
	});

	return storeAssets;
};

export default Groups;
