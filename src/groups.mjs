import filterJSON, { getMarketInfo, getIdentificationInfo } from "./filterjson.mjs"
import { getThumbnail } from "./thumbnails.mjs"

const Groups = {}

Groups.get = async function(userId) {
    const groups = await filterJSON({
        url: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false&includeNotificationPreferences=false`,
        exhaust: false,
        filter: function(row) {
            const group = row.group
            if (!group || group.owner?.userId !== userId) return

            return {
                ID: group.id,
                Name: group.name,
            }
        }
    })

    return groups
}

Groups.getStoreAssets = async function(groupId) {
    const storeAssets = await filterJSON({
        url: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${groupId}&CreatorType=2&Limit=30&SortType=3`,
        exhaust: true,
        filter: async function(item) {
            return {
                ID: item.id,
                Name: item.name,
                Price: item.price,
                CreatorID: groupId,
                CreatorType: "Group",
                Thumbnail: await getThumbnail(item.id, "Asset"),
            }
        }
    })

    return storeAssets
}

export default Groups
