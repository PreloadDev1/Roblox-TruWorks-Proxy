// src/routes/profile.mjs
import filterJSON from "../utils/filterjson.mjs";
import Groups from "./groups.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

const Profile = {};

function parseDateParts(dateString) {
	if (!dateString) return null;
	const date = new Date(dateString);
	return {
		Year: date.getUTCFullYear(),
		Month: date.getUTCMonth() + 1,
		Day: date.getUTCDate(),
		Hour: date.getUTCHours(),
		Minute: date.getUTCMinutes(),
		Second: date.getUTCSeconds(),
		Millisecond: date.getUTCMilliseconds(),
	};
}

Profile.getBasicInfo = async function (userId) {
	const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
	if (!res.ok) throw new Error("Failed to fetch user profile");
	const data = await res.json();
	return {
		UserID: data.id,
		Username: data.name,
		DisplayName: data.displayName,
		Description: data.description,
		IsBanned: data.isBanned,
		IsVerified: data.hasVerifiedBadge,
		Created: parseDateParts(data.created),
	};
};

Profile.getFollowers = async function (userId) {
	const followers = await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followers?limit=100`,
		exhaust: true,
		filter: async (row) => await Profile.getBasicInfo(row.id),
	});
	return {
		Count: followers.length,
		List: followers,
	};
};

Profile.getFollowings = async function (userId) {
	return await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followings?limit=100`,
		exhaust: true,
		filter: async (row) => await Profile.getBasicInfo(row.id),
	});
};

Profile.getFriends = async function (userId) {
	const friends = await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/friends`,
		exhaust: false,
		filter: async (row) => await Profile.getBasicInfo(row.id),
	});
	return {
		count: friends.length,
		list: friends,
	};
};

Profile.getBadges = async function (userId) {
	const badges = await filterJSON({
		url: `https://badges.roblox.com/v1/users/${userId}/badges?limit=100`,
		exhaust: true,
		filter: (badge) => ({
			ID: badge.id,
			Name: badge.name,
			Description: badge.description,
			AwardedDate: badge.awardedDate,
			Thumbnail: badge.imageUrl,
		}),
	});
	return {
		count: badges.length,
		list: badges,
	};
};

Profile.getSocialLinks = async function (userId) {
	const res = await fetch(`https://users.roblox.com/v1/users/${userId}/social-links`);
	if (!res.ok) return [];
	const data = await res.json();
	return data.data || [];
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
		Games: [],
	};

	const [
		basicInfo,
		followers,
		friends,
		following,
		badges,
		socialLinks,
		userGames,
		userGroups
	] = await Promise.all([
		Profile.getBasicInfo(userId),
		Profile.getFollowers(userId),
		Profile.getFriends(userId),
		Profile.getFollowings(userId),
		Profile.getBadges(userId),
		Profile.getSocialLinks(userId),
		Games.get(userId, CreatorTypes.User),
		Groups.get(userId),
	]);

	Object.assign(result, basicInfo);
	result.FollowerCount = followers.Count;
	result.Followers = followers.List;
	result.FriendsCount = friends.Count;
	result.Friends = friends.List;
	result.Following = following;
	result.BadgeCount = badges.Count;
	result.Badges = badges.List;
	result.SocialLinks = socialLinks;

	// 🧩 User merch
	const userMerch = await Users.getStoreAssets(userId, CreatorTypes.User, userId);
	if (Array.isArray(userMerch)) result.UserMerch.push(...userMerch);

	// 🧩 User-owned games, passes, dev products
	for (const game of userGames) {
		const [passes, favorites, devProducts] = await Promise.all([
			Games.getPasses(game.UniverseID, CreatorTypes.User, userId),
			Profile.getFavoriteCounts(game.UniverseID),
			Games.getDevProducts(game.UniverseID, CreatorTypes.User, userId),
		]);

		game.Favorites = favorites.favorites;
		result.Games.push(game);
		result.UserPasses.push(...passes); // ✅ correct destination
		result.DevProducts.push(...devProducts);
	}

	// 🧩 Group-owned games, passes, merch, dev products
	for (const group of userGroups) {
		const groupId = group.ID;

		const [groupGames, groupMerch] = await Promise.all([
			Games.get(groupId, CreatorTypes.Group),
			Users.getStoreAssets(groupId, CreatorTypes.Group, groupId)
		]);

		if (Array.isArray(groupMerch)) result.GroupMerch.push(...groupMerch);

		for (const game of groupGames) {
			const [passes, favorites, devProducts] = await Promise.all([
				Games.getPasses(game.UniverseID, CreatorTypes.Group, groupId),
				Profile.getFavoriteCounts(game.UniverseID),
				Games.getDevProducts(game.UniverseID, CreatorTypes.Group, groupId),
			]);

			game.Favorites = favorites.favorites;
			result.Games.push(game);
			result.GroupPasses.push(...passes); // ✅ correct destination
			result.DevProducts.push(...devProducts);
		}
	}

	return result;
};


export default Profile;
