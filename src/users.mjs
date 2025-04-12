import filterJSON, { getMarketInfo } from "./filterjson.mjs"

const Users = {}

Groups.getStoreAssets = async function (groupId, creatorType, creatorId) {
	return await filterJSON({
		url: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${groupId}&CreatorType=2&Limit=30`,
		exhaust: true,
		filter: getMarketInfo(creatorType, creatorId),
	})
}

export default Users
