import filterJSON, { getIdentificationInfo } from "./filterjson.mjs";
import Groups from "./groups.mjs";
import Games, { CreatorTypes } from "./games.mjs";

const Profile = {};

Profile.getBasicInfo = async function (userId) {
	const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
	if (!response.ok) throw new Error("Failed to get profile info");
	return await response.json();
};

Profile.getFollowersCount = async function (userId) {
	const response = await fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
	if (!response.ok) return 0;
	const data = await response.json();
	return data.count || 0;
};

Profile.getFollowings = async function (userId) {
	return await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followings?limit=100`,
		exhaust: true,
		filter: getIdentificationInfo,
	});
};

Profile.getFavoriteCounts = async function (universeId) {
	const response = await fetch(`https://games.roblox.com/v1/games/${universeId}/votes`);
	if (!response.ok) return { favorites: 0 };
	const data = await response.json();
	return { favorites: data.favoritedCount || 0 };
};

Profile.getPublicAssets = async function (userId) {
	const games = await Games.get(userId, CreatorTypes.User);
	const groups = await Groups.get(userId);

	const result = {
		UserId: userId,
		Username: null,
		DisplayName: null,
		Description: null,
		IsBanned: false,
		Created: null,
		Followers: 0,
		Following: [],
		Passes: [],
		GroupPasses: [],
		GroupStoreAssets: [],
		Games: [],
	};

	const basicInfo = await Profile.getBasicInfo(userId);
	Object.assign(result, basicInfo);
	result.Followers = await Profile.getFollowersCount(userId);
	result.Following = await Profile.getFollowings(userId);

	for (const game of games) {
		const gamePasses = await Games.getPasses(game.UniverseID, CreatorTypes.User, userId);
		const favoriteInfo = await Profile.getFavoriteCounts(game.UniverseID);
		game.Favorites = favoriteInfo.favorites;

		result.Games.push(game);
		result.Passes.push(...gamePasses);
	}

	for (const group of groups) {
		const groupGames = await Games.get(group.ID, CreatorTypes.Group);
		const groupAssets = await Groups.getStoreAssets(group.ID);

		for (const game of groupGames) {
			const gamePasses = await Games.getPasses(game.UniverseID, CreatorTypes.Group, group.ID);
			const favoriteInfo = await Profile.getFavoriteCounts(game.UniverseID);
			game.Favorites = favoriteInfo.favorites;

			result.GroupPasses.push(...gamePasses);
			result.Games.push(game);
		}

		result.GroupStoreAssets.push(...groupAssets);
	}

	return result;
};

export default Profile;
