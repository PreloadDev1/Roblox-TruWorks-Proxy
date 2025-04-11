import filterJSON, { getMarketInfo } from "./filterjson.mjs"

const Users = {}

Users.getStoreAssets = async function(userId) {
    const storeAssets = await filterJSON({
        url: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${userId}&CreatorType=1&Limit=30`,
        exhaust: true,
        filter: getMarketInfo,
    })

    return storeAssets
}

export default Users
