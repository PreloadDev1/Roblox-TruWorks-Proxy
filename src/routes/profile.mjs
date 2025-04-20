import filterJSON, { getIdentificationInfo } from "./filterjson.mjs";
import Groups from "./groups.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

const Profile = {};

// Helper to parse ISO timestamp into detailed date parts
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
		Millisecond: date.getUTCMilliseconds()
	};
}

// Basic user info
Profile.getBasicInfo = async function (userId) {
	const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
	if (!res.ok) throw new Error("Failed to fetch user profile");
	const data = await res.json();
	data.Created = parseDateParts(data.created);
	return data;
};

// Followers
Profile.getFollowers = async function (userId) {
	const followers = await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followers?limit=100`,
		exhaust: true,
		filter: getIdentificationInfo,
	});
	return {
		count: followers.length,
		list: followers,
	};
};

// Followings
Profile.getFollowings = async function (userId) {
	return await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followings?limit=100`,
		exhaust: true,
		filter: getIdentificationInfo,
	});
};

// Friends
Profile.getFriends = async function (userId) {
	const friends = await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/friends`,
		exhaust: false,
		filter: getIdentificationInfo,
	});
	return {
		count: friends.length,
		list: friends,
	};
};

// Is Following
Profile.isFollowing = async function (userId, targetId) {
	const res = await fetch(`https://friends.roblox.com/v1/users/${userId}/followings/${targetId}`);
	if (!res.ok) return false;
	const data = await res.json();
	return data.isFollowing === true;
};

// Get Game Favorite Count
Profile.getFavoriteCounts = async function (universeId) {
	const res = await fetch(`https://games.roblox.com/v1/games/${universeId}/votes`);
	if (!res.ok) return { favorites: 0 };
	const data = await res.json();
	return { favorites: data.favoritedCount || 0 };
};

// Badges
Profile.getBadges = async function (userId) {
	const badges = await filterJSON({
		url: `https://badges.roblox.com/v1/users/${userId}/badges?limit=100`,
		exhaust: true,
		filter: (badge) => ({
			ID: badge.id,
			Name: badge.name,
			Description: badge.description,
			AwardedDate: badge.awardedDate,
			Icon: badge.imageUrl,
		}),
	});
	return {
		count: badges.length,
		list: badges,
	};
};

// Social links
Profile.getSocialLinks = async function (userId) {
	const res = await fetch(`https://users.roblox.com/v1/users/${userId}/social-links`);
	if (!res.ok) return [];
	const data = await res.json();
	return data.data || [];
};

// Main function to fetch all public assets
Profile.getPublicAssets = async function (userId) {
	const result = {
		UserID: userId,
		Username: null,
		DisplayName: null,
		Description: null,
		IsBanned: false,
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
	result.FollowerCount = followers.count;
	result.Followers = followers.list;
	result.FriendsCount = friends.count;
	result.Friends = friends.list;
	result.Following = following;
	result.BadgeCount = badges.count;
	result.Badges = badges.list;
	result.SocialLinks = socialLinks;

	// User-owned merch
	const userMerch = await Users.getStoreAssets(userId, CreatorTypes.User, userId);
	if (Array.isArray(userMerch)) result.UserMerch.push(...userMerch);

	// User-owned games, passes, dev products
	for (const game of userGames) {
		const [passes, favorites, devProducts] = await Promise.all([
			Games.getPasses(game.UniverseID, CreatorTypes.User, userId),
			Profile.getFavoriteCounts(game.UniverseID),
			Games.getDevProducts(game.UniverseID, CreatorTypes.User, userId),
		]);

		game.Favorites = favorites.favorites;
		result.Games.push(game);
		result.UserPasses.push(...passes);
		result.DevProducts.push(...devProducts);
	}

	// Group-owned games and merch
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
			result.GroupPasses.push(...passes);
			result.DevProducts.push(...devProducts);
		}
	}

	return result;
};

export default Profile;
