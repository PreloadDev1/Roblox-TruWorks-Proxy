import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"
import PublicAssets from "./PublicAssetsService.mjs"

const Profile = {}

function ParseDate(DateString) {
	if (!DateString) return null

	const Date = new globalThis.Date(DateString)

	return {
		Year: Date.getUTCFullYear(),
		Month: Date.getUTCMonth() + 1,
		Day: Date.getUTCDate(),
		Hour: Date.getUTCHours(),
		Minute: Date.getUTCMinutes(),
		Second: Date.getUTCSeconds(),
		Millisecond: Date.getUTCMilliseconds()
	}
}

Profile.GetBasicInfo = async function (UserID) {
	const Res = await fetch(`https://users.roblox.com/v1/users/${UserID}`)
	if (!Res.ok) throw new Error("Failed to fetch basic info")

	const Data = await Res.json()

	return {
		UserID: Data.id,
		Username: Data.name,
		DisplayName: Data.displayName,
		Description: Data.description,
		IsBanned: Data.isBanned,
		IsVerified: Data.hasVerifiedBadge,
		Created: ParseDate(Data.created)
	}
}

Profile.GetSocialLinks = async function (UserID) {
	const Res = await fetch(`https://users.roblox.com/v1/users/${UserID}/social-links`)
	if (!Res.ok) return []

	const Data = await Res.json()
	return Data?.data || []
}

Profile.GetFavoriteCounts = async function (UniverseID) {
	const Res = await fetch(`https://games.roblox.com/v1/games/${UniverseID}/votes`)
	if (!Res.ok) return { Favourites: 0 }

	const Data = await Res.json()
	return { Favourites: Data.favoritedCount || 0 }
}

Profile.GetDevProducts = async function (UserID) {
	const GamesList = await Games.Get(UserID, CreatorTypes.User)
	const All = []

	for (const Game of GamesList) {
		const Products = await Games.GetDevProducts(Game.UniverseID, CreatorTypes.User, UserID)
		All.push(...Products)
	}

	return All
}

Profile.GetBadges = async function (UserID) {
	return await Users.GetBadges(UserID)
}

Profile.GetFollowers = async function (UserID) {
	return await Users.GetFollowers(UserID)
}

Profile.GetFriends = async function (UserID) {
	return await Users.GetFriends(UserID)
}

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
	}

	try {
		const [
			Basic,
			Followers,
			Friends,
			Badges,
			Socials,
			UserGames,
			GroupsList,
			Assets
		] = await Promise.all([
			Profile.GetBasicInfo(UserID),
			Profile.GetFollowers(UserID),
			Profile.GetFriends(UserID),
			Profile.GetBadges(UserID),
			Profile.GetSocialLinks(UserID),
			Games.Get(UserID, CreatorTypes.User),
			Groups.Get(UserID),
			PublicAssets.GetAll(UserID)
		])

		Object.assign(Result, Basic)

		Result.FollowerCount = Followers.Count
		Result.Followers = Followers.List

		Result.FriendsCount = Friends.Count
		Result.Friends = Friends.List

		Result.BadgeCount = Badges.Count
		Result.Badges = Badges.List

		Result.SocialLinks = Socials

		Result.UserPasses = Assets.UserPasses
		Result.UserMerch = Assets.UserMerch
		Result.GroupPasses = Assets.GroupPasses
		Result.GroupMerch = Assets.GroupMerch

		for (const Game of UserGames) {
			const [Favorites, DevProducts] = await Promise.all([
				Profile.GetFavoriteCounts(Game.UniverseID),
				Games.GetDevProducts(Game.UniverseID, CreatorTypes.User, UserID)
			])

			Game.Favourites = Favorites.Favourites
			Result.DevProducts.push(...DevProducts)
			Result.Games.push(Game)
		}

		for (const Group of GroupsList) {
			for (const Game of Group.Games || []) {
				const [Favorites, DevProducts] = await Promise.all([
					Profile.GetFavoriteCounts(Game.UniverseID),
					Games.GetDevProducts(Game.UniverseID, CreatorTypes.Group, Group.ID)
				])

				Game.Favourites = Favorites.Favourites
				Result.DevProducts.push(...DevProducts)
				Result.Games.push(Game)
			}
		}
	} catch (err) {
		console.error("[Profile.GetPublicAssets]", err)
	}

	return Result
}

export default Profile
