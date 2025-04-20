import filterJSON, { getMarketInfo } from "./filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";

const Groups = {};

// Get groups owned by the user
Groups.get = async function (userId) {
    const groups = await filterJSON({
        url: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false&includeNotificationPreferences=false`,
        exhaust: false,
        filter: function (row) {
            const group = row.group;
            if (!group || !group.id || !row.role || !row.role.rank) return null;

            const isOwner = row.role.rank === 255;
            if (!isOwner) {
                console.log(`[GroupFetch] Skipping group '${group.name}' (ID ${group.id}) — not the owner (Rank ${row.role.rank})`);
                return null;
            }

            console.log(`[GroupFetch] Including group '${group.name}' (ID ${group.id}) as owned`);
            return {
                ID: group.id,
                Name: group.name,
            };
        }
    });

    console.log(`[UserGroups] ${groups.length} groups found for user ${userId}`);
    return groups;
};

// Get store assets for a group
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
                Thumbnail: await getThumbnail(item.id, "Asset"),
            };
        }
    });

    return storeAssets;
};

export default Groups;
