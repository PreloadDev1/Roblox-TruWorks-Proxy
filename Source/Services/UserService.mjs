import { GetAllPages } from "../Utilities/GetAllPages.mjs"
import { GetMarketInfo } from "../Utilities/FilterJson.mjs"

class Users {
  static async GetStoreAssets(TargetID, CreatorType, CreatorID) {
    const url = `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${TargetID}&CreatorType=${
      CreatorType === "Groups" ? 2 : 1
    }&Limit=30&SortType=3`
    return await GetAllPages(url, GetMarketInfo(CreatorType, CreatorID))
  }

  static async GetFollowers(UserID) {
    const url = `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`
    const raw = await GetAllPages(url, (entry) => entry)

    const list = await Promise.all(
      raw.map(async ({ id }) => {
        const res = await fetch(`https://users.roblox.com/v1/users/${id}`)
        if (!res.ok) return null
        const data = await res.json()
        return {
          UserID: data.id,
          Username: data.name,
          DisplayName: data.displayName,
          Description: data.description,
          IsBanned: data.isBanned,
          IsVerified: data.hasVerifiedBadge,
          Created: data.created
        }
      })
    )

    const filtered = list.filter(Boolean)
    return {
      Count: filtered.length,
      List: filtered
    }
  }

  static async GetFriends(UserID) {
    const url = `https://friends.roblox.com/v1/users/${UserID}/friends?limit=100`
    const raw = await GetAllPages(url, (entry) => entry)

    const list = await Promise.all(
      raw.map(async ({ id }) => {
        const res = await fetch(`https://users.roblox.com/v1/users/${id}`)
        if (!res.ok) return null
        const data = await res.json()
        return {
          UserID: data.id,
          Username: data.name,
          DisplayName: data.displayName,
          Description: data.description,
          IsBanned: data.isBanned,
          IsVerified: data.hasVerifiedBadge,
          Created: data.created
        }
      })
    )

    const filtered = list.filter(Boolean)
    return {
      Count: filtered.length,
      List: filtered
    }
  }

  static async GetBadges(UserID) {
    const url = `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100`
    const raw = await GetAllPages(
      url,
      ({ id, name, description, awardedDate, imageUrl, statistics }) => ({
        ID: id,
        Name: name,
        Description: description,
        AwardedDate: awardedDate,
        AwardedCount: statistics?.awardedCount || 0,
        WinRatePercentage: statistics?.winRatePercentage || 0,
        Thumbnail: imageUrl || null
      })
    )

    return {
      Count: raw.length,
      List: raw
    }
  }
}

export default Users
