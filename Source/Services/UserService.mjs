import { GetAllPages } from "../Utilities/GetAllPages.mjs"
import { GetMarketInfo } from "../Utilities/FilterJson.mjs"

const Users = {}

Users.GetStoreAssets = async function (TargetID, CreatorType, CreatorID) {
	const URL = `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${TargetID}&CreatorType=${CreatorType === "Groups" ? 2 : 1}&Limit=30&SortType=3`
	return await GetAllPages(URL, GetMarketInfo(CreatorType, CreatorID))
}

Users.GetFollowers = async function (UserID) {
	const URL = `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`
	const Raw = await GetAllPages(URL, async (Entry) => Entry)

	const Profiles = await Promise.all(
		Raw.map(async (Entry) => {
			try {
				const Res = await fetch(`https://users.roblox.com/v1/users/${Entry.id}`)
				if (!Res.ok) return null
				const Data = await Res.json()
				return {
					UserID: Data.id,
					Username: Data.name,
					DisplayName: Data.displayName,
					Description: Data.description,
					IsBanned: Data.isBanned,
					IsVerified: Data.hasVerifiedBadge,
					Created: Data.created
				}
			} catch {
				return null
			}
		})
	)

	return {
		Count: Profiles.length,
		List: Profiles.filter(Boolean)
	}
}

Users.GetFriends = async function (UserID) {
	const URL = `https://friends.roblox.com/v1/users/${UserID}/friends`
	const Raw = await GetAllPages(URL, async (Entry) => Entry)

	const Profiles = await Promise.all(
		Raw.map(async (Entry) => {
			try {
				const Res = await fetch(`https://users.roblox.com/v1/users/${Entry.id}`)
				if (!Res.ok) return null
				const Data = await Res.json()
				return {
					UserID: Data.id,
					Username: Data.name,
					DisplayName: Data.displayName,
					Description: Data.description,
					IsBanned: Data.isBanned,
					IsVerified: Data.hasVerifiedBadge,
					Created: Data.created
				}
			} catch {
				return null
			}
		})
	)

	return {
		Count: Profiles.length,
		List: Profiles.filter(Boolean)
	}
}

Users.GetBadges = async function (UserID) {
	const URL = `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100`
	const Raw = await GetAllPages(URL, async (Badge) => {
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
		Count: Raw.length,
		List: Raw
	}
}

export default Users
