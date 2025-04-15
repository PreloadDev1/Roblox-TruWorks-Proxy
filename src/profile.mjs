import filterJSON, { getIdentificationInfo } from "./filterjson.mjs";
import Groups from "./groups.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

const Profile = {};

Profile.getBasicInfo = async function (userId) {
	const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
	if (!res.ok) throw new Error("Failed to fetch user profile");
	return await res.json();
};

Profile.getFollowersCount = async function (userId) {
	const res = await fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
	if (!res.ok) return 0;
	const data = await res.json();
	return data.count || 0;
};

Profile.getFollowings = async function (userId) {
	return await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followings?limit=100`,
		exhaust: true,
		filter: getIdentificationInfo
	});
};

Profile.getFavoriteCounts = async function (universeId) {
	const res = await fetch(`https://games.roblox.com/v1/games/${universeId}/votes`);
	if (!res.ok) return { favorites: 0 };
	const data = await res.json();
	return { favorites: data.favoritedCount || 0 };
};

Profile.getPublicAssets = async function (userId) {
	const result = {
		UserID: userId,
		Username: null,
		DisplayName: null,
		Description: null,
		IsBanned: false,
		Created: null,
		Followers: 0,
		Following: [],
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: [],
		Games: [],
	};

	const [basicInfo, followers, following, userGames, groups] = await Promise.all([
		Profile.getBasicInfo(userId),
		Profile.getFollowersCount(userId),
		Profile.getFollowings(userId),
		Games.get(userId, CreatorTypes.User),
		Groups.get(userId)
	]);

	Object.assign(result, basicInfo);
	result.Followers = followers;
	result.Following = following;

	const userMerch = await Users.getStoreAssets(userId, CreatorTypes.User, userId);
	if (Array.isArray(userMerch)) result.UserMerch.push(...userMerch);

	for (const game of userGames) {
		const [passes, favs] = await Promise.all([
			Games.getPasses(game.UniverseID, CreatorTypes.User, userId),
			Profile.getFavoriteCounts(game.UniverseID),
		]);
		game.Favorites = favs.favorites;
		result.Games.push(game);
		result.UserPasses.push(...passes);
	}

	for (const group of groups) {
		const groupId = group.ID;
		const groupGames = await Games.get(groupId, CreatorTypes.Group);
		const groupMerch = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId);
		if (Array.isArray(groupMerch)) result.GroupMerch.push(...groupMerch);

		for (const game of groupGames) {
			const [passes, favs] = await Promise.all([
				Games.getPasses(game.UniverseID, CreatorTypes.Group, groupId),
				Profile.getFavoriteCounts(game.UniverseID),
			]);
			game.Favorites = favs.favorites;
			result.Games.push(game);
			result.GroupPasses.push(...passes);
		}
	}

	return result;
};

export default Profile;
