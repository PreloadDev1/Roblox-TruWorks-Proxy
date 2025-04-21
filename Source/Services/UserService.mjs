import FilterJSON from "../Utilities/FilterJson.mjs"
import { GetMarketInfo } from "../Utilities/FilterJson.mjs"
import { GetAllPages } from "../Utilities/GetAllPages.mjs"

const Users = {}

Users.GetStoreAssets = async function (UserID, CreatorType, CreatorID) {
	const URL = `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${UserID}&CreatorType=1&Limit=30`
	return await GetAllPages(URL, GetMarketInfo(CreatorType, CreatorID))
}

Users.GetFollowers = async function (UserID) {
	const URL = `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`
	const Followers = await GetAllPages(URL, async (Entry) => Entry)

	return {
		Count: Followers.length,
		List: Followers
	}
}

Users.GetFriends = async function (UserID) {
	const URL = `https://friends.roblox.com/v1/users/${UserID}/friends?limit=100`

	const Friends = await GetAllPages(URL, async (Entry) => {
		try {
			const Res = await fetch(`https://users.roblox.com/v1/users/${Entry.id}`)
			if (!Res.ok) return null

			const Info = await Res.json()

			return {
				UserID: Info.id,
				Username: Info.name,
				DisplayName: Info.displayName,
				Description: Info.description,
				IsBanned: Info.isBanned,
				IsVerified: Info.hasVerifiedBadge,
				Created: new Date(Info.created)
			}
		} catch {
			return null
		}
	})

	return {
		Count: Friends.length,
		List: Friends
	}
}

Users.GetBadges = async function (UserID) {
	const URL = `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100`

	const Badges = await GetAllPages(URL, async (Badge) => {
		return {
			ID: Badge.id,
			Name: Badge.name,
			Description: Badge.description,
			AwardedDate: Badge.awardedDate,
			AwardedCount: Badge.statistics?.awardedCount || 0,
			WinRatePercentage: Badge.statistics?.winRatePercentage || null,
			Thumbnail: Badge.imageUrl || null
		}
	})

	return {
		Count: Badges.length,
		List: Badges
	}
}

export default Users
