import Games, { CreatorTypes } from "./GameService.mjs";
import Groups from "./GroupService.mjs";
import Users from "./UserService.mjs";
import { GetMarketInfo, ToPascalCaseObject } from "../Utilities/FilterJson.mjs";

const Profile = {};

function ParseDateParts(DateString) {
	if (!DateString) return null;

	const Date = new Date(DateString);
	return {
		Year: Date.getUTCFullYear(),
		Month: Date.getUTCMonth() + 1,
		Day: Date.getUTCDate(),
		Hour: Date.getUTCHours(),
		Minute: Date.getUTCMinutes(),
		Second: Date.getUTCSeconds(),
		Millisecond: Date.getUTCMilliseconds(),
	};
}

Profile.GetBasicInfo = async function (UserID) {
	const Response = await fetch(`https://users.roblox.com/v1/users/${UserID}`);
	if (!Response.ok) throw new Error("Failed to fetch user profile");

	const Data = await Response.json();
	return {
		UserID: Data.id,
		Username: Data.name,
		DisplayName: Data.displayName,
		Description: Data.description,
		IsBanned: Data.isBanned,
		IsVerified: Data.hasVerifiedBadge,
		Created: ParseDateParts(Data.created),
	};
};

Profile.GetBadges = async function (UserID) {
	const Response = await fetch(`https://badges.roblox.com/v1/users/${UserID}/badges?limit=100`);
	if (!Response.ok) return { Count: 0, List: [] };

	const Data = await Response.json();
	const List = Data.data.map(Badge => ({
		ID: Badge.id,
		Name: Badge.name,
		Description: Badge.description,
		AwardedDate: Badge.awardedDate,
		Thumbnail: Badge.imageUrl
	}));

	return {
		Count: List.length,
		List
	};
};

Profile.GetFollowers = async function (UserID) {
	const Response = await fetch(`https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`);
	if (!Response.ok) return { Count: 0, List: [] };

	const Data = await Response.json();
	const List = await Promise.all(Data.data.map(User => Profile.GetBasicInfo(User.id)));

	return {
		Count: List.length,
		List
	};
};

Profile.GetFriends = async function (UserID) {
	const Response = await fetch(`https://friends.roblox.com/v1/users/${UserID}/friends`);
	if (!Response.ok) return { Count: 0, List: [] };

	const Data = await Response.json();
	const List = await Promise.all(Data.data.map(User => Profile.GetBasicInfo(User.id)));

	return {
		Count: List.length,
		List
	};
};

Profile.GetFollowings = async function (UserID) {
	const Response = await fetch(`https://friends.roblox.com/v1/users/${UserID}/followings?limit=100`);
	if (!Response.ok) return [];

	const Data = await Response.json();
	const List = await Promise.all(Data.data.map(User => Profile.GetBasicInfo(User.id)));

	return List;
};

Profile.GetSocialLinks = async function (UserID) {
	const Response = await fetch(`https://users.roblox.com/v1/users/${UserID}/social-links`);
	if (!Response.ok) return [];

	const Data = await Response.json();
	return Data.data || [];
};

Profile.GetFavoriteCounts = async function (UniverseID) {
	const Response = await fetch(`https://games.roblox.com/v1/games/${UniverseID}/votes`);
	if (!Response.ok) return { Favourites: 0 };

	const Data = await Response.json();
	return {
		Favourites: Data.favoritedCount || 0
	};
};

Profile.GetDevProducts = async function (UserID) {
	const GamesList = await Games.Get(UserID, CreatorTypes.User);
	const All = [];

	for (const Game of GamesList) {
		const DevProducts = await Games.GetDevProducts(Game.UniverseID, CreatorTypes.User, UserID);
		All.push(...DevProducts);
	}

	return All;
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
		SocialLinks: [],

		BadgeCount: 0,
		Badges: [],

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
			Socials,
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
		Result.FollowerCount = Followers.Count;
		Result.Followers = Followers.List;
		Result.FriendsCount = Friends.Count;
		Result.Friends = Friends.List;
		Result.Following = Following;
		Result.BadgeCount = Badges.Count;
		Result.Badges = Badges.List;
		Result.SocialLinks = Socials;

		Result.UserMerch = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID);

		for (const Game of UserGames) {
			const [Passes, DevProducts, FavouriteCounts] = await Promise.all([
				Games.GetPasses(Game.UniverseID, CreatorTypes.User, UserID),
				Games.GetDevProducts(Game.UniverseID, CreatorTypes.User, UserID),
				Profile.GetFavoriteCounts(Game.UniverseID)
			]);

			Game.Favourites = FavouriteCounts.Favourites;
			Result.UserPasses.push(...Passes);
			Result.DevProducts.push(...DevProducts);
			Result.Games.push(Game);
		}

		for (const Group of UserGroups) {
			const GroupID = Group.ID;

			const [GroupGames, GroupMerch] = await Promise.all([
				Games.Get(GroupID, CreatorTypes.Group),
				Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)
			]);

			if (Array.isArray(GroupMerch)) Result.GroupMerch.push(...GroupMerch);

			for (const Game of GroupGames) {
				const [Passes, DevProducts, FavouriteCounts] = await Promise.all([
					Games.GetPasses(Game.UniverseID, CreatorTypes.Group, GroupID),
					Games.GetDevProducts(Game.UniverseID, CreatorTypes.Group, GroupID),
					Profile.GetFavoriteCounts(Game.UniverseID)
				]);

				Game.Favourites = FavouriteCounts.Favourites;
				Result.GroupPasses.push(...Passes);
				Result.DevProducts.push(...DevProducts);
				Result.Games.push(Game);
			}
		}

	} catch (Error) {
		console.error("[GetPublicAssets] Error:", Error);
	}

	return Result;
};

export default Profile;
