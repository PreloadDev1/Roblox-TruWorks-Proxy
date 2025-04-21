import FilterJSON from "../Utilities/FilterJson.mjs";
import { GetMarketInfo } from "../Utilities/FilterJson.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";

const Users = Users || {};

Users.GetStoreAssets = async function (UserID, CreatorType, CreatorID) {
	const Response = await FilterJSON({
		URL: `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${UserID}&CreatorType=1&Limit=30`,
		Exhaust: true,
		Filter: GetMarketInfo(CreatorType, CreatorID)
	});

	return Array.isArray(Response) ? Response.map(ToPascalCaseObject) : [];
};

Users.GetFollowers = async function (UserID) {
	const List = [];
	let Cursor = "";
	let HasMore = true;

	while (HasMore) {
		try {
			const URL = `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100${Cursor ? `&cursor=${Cursor}` : ""}`;
			const Response = await fetch(URL);

			if (!Response.ok) break;

			const Data = await Response.json();
			if (!Array.isArray(Data.data)) break;

			List.push(...Data.data.map(ToPascalCaseObject));

			Cursor = Data.nextPageCursor;
			HasMore = !!Cursor;
		} catch {
			break;
		}
	}

	return {
		Count: List.length,
		List
	};
};

Users.GetBadges = async function (UserID) {
	const List = [];
	let Cursor = "";
	let HasMore = true;

	while (HasMore) {
		try {
			const URL = `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100${Cursor ? `&cursor=${Cursor}` : ""}`;
			const Response = await fetch(URL);

			if (!Response.ok) break;

			const Data = await Response.json();
			if (!Array.isArray(Data.data)) break;

			List.push(...Data.data.map(ToPascalCaseObject));

			Cursor = Data.nextPageCursor;
			HasMore = !!Cursor;
		} catch {
			break;
		}
	}

	return {
		Count: List.length,
		List
	};
};

Users.GetFriends = async function (UserID) {
	const List = [];
	let Cursor = "";
	let HasMore = true;

	while (HasMore) {
		try {
			const URL = `https://friends.roblox.com/v1/users/${UserID}/friends?limit=100${Cursor ? `&cursor=${Cursor}` : ""}`;
			const Response = await fetch(URL);

			if (!Response.ok) break;

			const Data = await Response.json();
			if (!Array.isArray(Data.data)) break;

			List.push(...Data.data.map(ToPascalCaseObject));

			Cursor = Data.nextPageCursor;
			HasMore = !!Cursor;
		} catch {
			break;
		}
	}

	return {
		Count: List.length,
		List
	};
};

export default Users;
