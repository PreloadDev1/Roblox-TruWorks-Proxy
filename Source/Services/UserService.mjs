import { FilterJSON, GetMarketInfo } from "../Utilities/FilterJson.mjs";

const Users = {};

Users.GetStoreAssets = async function (UserID, CreatorType, CreatorID) {
	return await FilterJSON({
		URL: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${UserID}&CreatorType=1&Limit=30`,
		Exhaust: true,
		Filter: GetMarketInfo(CreatorType, CreatorID)
	});
};

export default Users;
