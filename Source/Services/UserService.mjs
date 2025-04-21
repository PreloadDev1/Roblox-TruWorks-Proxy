import FilterJSON from "../Utilities/FilterJson.mjs";
import { GetMarketInfo } from "../Utilities/FilterJson.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";

const Users = {};

Users.GetStoreAssets = async function (UserID, CreatorType, CreatorID) {
	const Response = await FilterJSON({
		URL: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${UserID}&CreatorType=1&Limit=30`,
		Exhaust: true,
		Filter: GetMarketInfo(CreatorType, CreatorID)
	});

	return Array.isArray(Response) ? Response.map(ToPascalCaseObject) : [];
};

export default Users;
