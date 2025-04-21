import Groups from "./GroupService.mjs";
import Games, { CreatorTypes } from "./GameService.mjs";
import Users from "./UserService.mjs";
import PublicAssets from "./PublicAssetsService.mjs";

const Profile = {};

function ParseDate(DateString) {
	if (!DateString) return null;

	const Date = new Date(DateString);

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
		Created: ParseDate(Data.created)
	};
};

Profile.GetSocialLinks = async function (UserID) {
	const Response = await fetch(`https://users.roblox.com/v1/users/${UserID}/social-links`);
	if (!Response.ok) return [];

	const Data = await Response.json();
	return Data?.data || [];
};

Profile.GetFavoriteCounts = async function (UniverseID) {
	const Response = await fetch(`https://games.roblox.com/v1/games/${UniverseID}/votes`);
	if (!Response.ok) return { Favorites: 0 };

	const Data = await Response.json();
	return { Favorites: Data.favoritedCount || 0 };
};

Profile.GetDevProducts = async function (UserID) {
	const GamesList = await Games.Get(UserID, CreatorTypes.User);
	const All = [];

	for (const Game of GamesList) {
		const Products = await Games.GetDevProducts(Game.UniverseID, CreatorTypes.User, UserID);
		All.push(...Products);
	}

	return All;
};

Profile.GetBadges = async function (UserID) {
	return await Users.GetBadges(UserID);
};

Profile.GetFollowers = async function (UserID) {
	return await Users.GetFollowers(UserID);
};

Profile.GetFriends = async function (UserID) {
	return await Users.GetFriends(UserID);
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
			Badges,
			SocialLinks,
			UserGames,
			UserGroups,
			AssetData
		] = await Promise.all([
			Profile.GetBasicInfo(UserID),
			Profile.GetFollowers(UserID),
			Profile.GetFriends(UserID),
			Profile.GetBadges(UserID),
			Profile.GetSocialLinks(UserID),
			Games.Get(UserID, CreatorTypes.User),
			Groups.Get(UserID),
			PublicAssets.GetAll(UserID)
		]);

		Object.assign(Result, BasicInfo);

		Result.FollowerCount = Followers.Count;
		Result.Followers = Followers.List;

		Result.FriendsCount = Friends.Count;
		Result.Friends = Friends.List;

		Result.BadgeCount = Badges.Count;
		Result.Badges = Badges.List;

		Result.SocialLinks = SocialLinks;

		if (Array.isArray(AssetData.UserMerch)) Result.UserMerch.push(...AssetData.UserMerch);
		if (Array.isArray(AssetData.GroupMerch)) Result.GroupMerch.push(...AssetData.GroupMerch);
		if (Array.isArray(AssetData.UserPasses)) Result.UserPasses.push(...AssetData.UserPasses);
		if (Array.isArray(AssetData.GroupPasses)) Result.GroupPasses.push(...AssetData.GroupPasses);

		for (const Game of UserGames) {
			const PlaceID = Game.PlaceID;

			const [Favorites, DevProducts, GameDetails] = await Promise.all([
				Profile.GetFavoriteCounts(Game.UniverseID),
				Games.GetDevProducts(PlaceID, CreatorTypes.User, UserID),
				Games.GetGameData?.(PlaceID)
			]);

			if (GameDetails) Object.assign(Game, GameDetails);

			Game.Favorites = Favorites.Favorites;

			Result.Games.push(Game);
			Result.DevProducts.push(...(DevProducts || []));
		}

		for (const Group of UserGroups) {
			const GroupID = Group.ID;

			const [GroupGames] = await Promise.all([
				Games.Get(GroupID, CreatorTypes.Group)
			]);

			for (const Game of GroupGames) {
				const PlaceID = Game.PlaceID;

				const [Favorites, DevProducts, GameDetails] = await Promise.all([
					Profile.GetFavoriteCounts(Game.UniverseID),
					Games.GetDevProducts(PlaceID, CreatorTypes.Group, GroupID),
					Games.GetGameData?.(PlaceID)
				]);

				if (GameDetails) Object.assign(Game, GameDetails);

				Game.Favorites = Favorites.Favorites;

				Result.Games.push(Game);
				Result.DevProducts.push(...(DevProducts || []));
			}
		}

	} catch (Error) {
		console.error("[Profile.GetPublicAssets] Error:", Error);
	}

	return Result;
};

export default Profile;
