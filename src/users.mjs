import filterJSON, { getMarketInfo } from "./filterjson.mjs"

const Users = {}

Users.getStoreAssets = async function (userId, creatorType, creatorId) {
	return await filterJSON({
		url: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${userId}&CreatorType=1&Limit=30`,
		exhaust: true,
		filter: getMarketInfo(creatorType, creatorId),
	})
}
export default Users
