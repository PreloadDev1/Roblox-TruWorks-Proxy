import filterJSON from "./filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";

const Groups = {};

Groups.get = async function(userId) {
	const groups = await filterJSON({
		url: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false`,
		exhaust: false,
		filter: (row) => {
			const group = row.group;
			if (!group || group.owner?.userId !== userId) return null;
			return {
				ID: group.id,
				Name: group.name,
			};
		}
	});

	return groups;
};

Groups.getStoreAssets = async function(groupId) {
	return await filterJSON({
		url: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${groupId}&CreatorType=2&Limit=30&SortType=3`,
		exhaust: true,
		filter: async (item) => ({
			ID: item.id,
			Name: item.name,
			Price: item.price,
			CreatorID: groupId,
			CreatorType: "Group",
			Thumbnail: await getThumbnail(item.id, "Asset"),
		})
	});
};

export default Groups;
