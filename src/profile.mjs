import filterJSON, { getIdentificationInfo } from "./filterjson.mjs";
import Groups from "./groups.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

const Profile = {};

// Basic user info
Profile.getBasicInfo = async function (userId) {
	const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
	if (!res.ok) throw new Error("Failed to fetch user profile");
	return await res.json();
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
	const followings = await filterJSON({
		url: `https://friends.roblox.com/v1/users/${userId}/followings?limit=100`,
		exhaust: true,
		filter: getIdentificationInfo,
	});
	return followings;
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

// Check if userId is following targetId
Profile.isFollowing = async function (userId, targetId) {
	const res = await fetch(`https://friends.roblox.com/v1/users/${userId}/followings/${targetId}`);
	if (!res.ok) return false;
	const data = await res.json();
	return data.isFollowing === true;
};

// Favorite count per game
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

// Main export
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

	// Fetch core profile info
	const [
		basicInfo,
		followers,
		friends,
		followings,
		badges,
		socialLinks,
		userGames,
		userGroups,
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

	// Assign identity
	Object.assign(result, basicInfo);
	result.FollowerCount = followers.count;
	result.Followers = followers.list;
	result.FriendsCount = friends.count;
	result.Friends = friends.list;
	result.Following = followings;
	result.BadgeCount = badges.count;
	result.Badges = badges.list;
	result.SocialLinks = socialLinks;

	// User items
	const userMerch = await Users.getStoreAssets(userId, CreatorTypes.User, userId);
	if (Array.isArray(userMerch)) result.UserMerch.push(...userMerch);

	// Games owned by user
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

	// Group-owned content
	for (const group of userGroups) {
		const groupId = group.ID;
		const groupGames = await Games.get(groupId, CreatorTypes.Group);
		const groupMerch = await Users.getStoreAssets(groupId, CreatorTypes.Group, groupId);

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
