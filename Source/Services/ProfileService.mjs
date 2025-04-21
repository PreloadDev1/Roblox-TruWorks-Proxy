import FilterJSON from "../Utilities/FilterJson.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";
import Groups from "./GroupService.mjs";
import Games, { CreatorTypes } from "./GameService.mjs";
import Users from "./UserService.mjs";

function ParseDate(DateString) {
	if (!DateString) return null;

	const Date = new globalThis.Date(DateString);

	return {
		Year: Date.getUTCFullYear(),
		Month: Date.getUTCMonth() + 1,
		Day: Date.getUTCDate(),
		Hour: Date.getUTCHours(),
		Minute: Date.getUTCMinutes(),
		Second: Date.getUTCSeconds(),
		Millisecond: Date.getUTCMilliseconds()
	};
}

const Profile = {};

Profile.GetDevProducts = async function (UserID) {
	const GamesList = await Games.Get(UserID, CreatorTypes.User);
	const AllProducts = [];

	for (const Game of GamesList) {
		const DevProducts = await Games.GetDevProducts(Game.UniverseID, CreatorTypes.User, UserID);
		AllProducts.push(...DevProducts);
	}

	return AllProducts;
};

Profile.GetBasicInfo = async function (UserID) {
	const Response = await fetch(`https://users.roblox.com/v1/users/${UserID}`);
	if (!Response.ok) throw new Error("Failed to fetch user profile");

	const Data = await Response.json();

	return ToPascalCaseObject({
		UserID: Data.id,
		Username: Data.name,
		DisplayName: Data.displayName,
		Description: Data.description,
		IsBanned: Data.isBanned,
		IsVerified: Data.hasVerifiedBadge,
		Created: ParseDate(Data.created)
	});
};

Profile.GetFollowers = async function (UserID) {
	const List = await FilterJSON({
		URL: `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`,
		Exhaust: true,
		Filter: async (Row) => await Profile.GetBasicInfo(Row.id)
	});

	return ToPascalCaseObject({
		Count: List.length,
		List
	});
};

Profile.GetFollowings = async function (UserID) {
	return await FilterJSON({
		URL: `https://friends.roblox.com/v1/users/${UserID}/followings?limit=100`,
		Exhaust: true,
		Filter: async (Row) => await Profile.GetBasicInfo(Row.id)
	});
};

Profile.GetFriends = async function (UserID) {
	const List = await FilterJSON({
		URL: `https://friends.roblox.com/v1/users/${UserID}/friends`,
		Exhaust: false,
		Filter: async (Row) => await Profile.GetBasicInfo(Row.id)
	});

	return ToPascalCaseObject({
		Count: List.length,
		List
	});
};

Profile.GetBadges = async function (UserID) {
	const List = await FilterJSON({
		URL: `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100`,
		Exhaust: true,
		Filter: (Badge) =>
			ToPascalCaseObject({
				ID: Badge.id,
				Name: Badge.name,
				Description: Badge.description,
				AwardedDate: Badge.awardedDate,
				Thumbnail: Badge.imageUrl
			})
	});

	return ToPascalCaseObject({
		Count: List.length,
		List
	});
};

Profile.GetSocialLinks = async function (UserID) {
	const Response = await fetch(`https://users.roblox.com/v1/users/${UserID}/social-links`);
	if (!Response.ok) return [];

	const Data = await Response.json();
	return Data.data || [];
};

Profile.GetFavoriteCounts = async function (UniverseID) {
	const Response = await fetch(`https://games.roblox.com/v1/games/${UniverseID}/votes`);
	if (!Response.ok) return { Favorites: 0 };

	const Data = await Response.json();

	return ToPascalCaseObject({
		Favorites: Data.favoritedCount || 0
	});
};

Profile.GetPublicAssets = async function (UserID) {
	const Result = {
		UserID,
		Username: null,
		DisplayName: null,
		Description: null,
		IsBanned: false,
		IsVerified: false,
		Created: null,
		FollowerCount: 0,
		Followers: [],
		FriendsCount: 0,
		Friends: [],
		Following: [],
		BadgeCount: 0,
		Badges: [],
		SocialLinks: [],
		UserPasses: [],
		GroupPasses: [],
		UserMerch: [],
		GroupMerch: [],
		DevProducts: [],
		Games: []
	};

	try {
		const [
			BasicInfo,
			Followers,
			Friends,
			Following,
			Badges,
			SocialLinks,
			UserGames,
			UserGroups
		] = await Promise.all([
			Profile.GetBasicInfo(UserID),
			Profile.GetFollowers(UserID),
			Profile.GetFriends(UserID),
			Profile.GetFollowings(UserID),
			Profile.GetBadges(UserID),
			Profile.GetSocialLinks(UserID),
			Games.Get(UserID, CreatorTypes.User),
			Groups.Get(UserID)
		]);

		Object.assign(Result, BasicInfo);

		Result.FollowerCount = Followers.Count || 0;
		Result.Followers = Followers.List || [];

		Result.FriendsCount = Friends.Count || 0;
		Result.Friends = Friends.List || [];

		Result.Following = Following || [];

		Result.BadgeCount = Badges.Count || 0;
		Result.Badges = Badges.List || [];

		Result.SocialLinks = SocialLinks || [];

		const UserMerch = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID);
		if (Array.isArray(UserMerch)) Result.UserMerch.push(...UserMerch);

		for (const Game of UserGames || []) {
			const PlaceID = Game.PlaceID;

			const [Passes, Favorites, DevProducts, GameDetails] = await Promise.all([
				Games.GetPasses(PlaceID, CreatorTypes.User, UserID),
				Profile.GetFavoriteCounts(Game.UniverseID),
				Games.GetDevProducts(PlaceID, CreatorTypes.User, UserID),
				Games.GetGameData?.(PlaceID)
			]);

			if (GameDetails) Object.assign(Game, GameDetails);
			Game.Favorites = Favorites.Favorites || 0;

			Result.Games.push(Game);
			Result.UserPasses.push(...(Passes || []));
			Result.DevProducts.push(...(DevProducts || []));
		}

		for (const Group of UserGroups || []) {
			const GroupID = Group.ID;

			const [GroupGames, GroupMerch] = await Promise.all([
				Games.Get(GroupID, CreatorTypes.Group),
				Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)
			]);

			if (Array.isArray(GroupMerch)) Result.GroupMerch.push(...GroupMerch);

			for (const Game of GroupGames || []) {
				const PlaceID = Game.PlaceID;

				const [Passes, Favorites, DevProducts, GameDetails] = await Promise.all([
					Games.GetPasses(PlaceID, CreatorTypes.Group, GroupID),
					Profile.GetFavoriteCounts(Game.UniverseID),
					Games.GetDevProducts(PlaceID, CreatorTypes.Group, GroupID),
					Games.GetGameData?.(PlaceID)
				]);

				if (GameDetails) Object.assign(Game, GameDetails);
				Game.Favorites = Favorites.Favorites || 0;

				Result.Games.push(Game);
				Result.GroupPasses.push(...(Passes || []));
				Result.DevProducts.push(...(DevProducts || []));
			}
		}
	} catch (Error) {
		console.error("[Profile.GetPublicAssets] Failed:", Error);
	}

	return ToPascalCaseObject(Result);
};

export default Profile;
