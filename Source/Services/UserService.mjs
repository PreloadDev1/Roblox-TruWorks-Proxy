import GetAllPages from "../Utilities/GetAllPages.mjs"
import { GetMarketInfo } from "../Utilities/FilterJson.mjs"

class Users {
  static async GetStoreAssets(TargetID, CreatorType, CreatorID) {
    const url = `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${TargetID}&CreatorType=${
      CreatorType === "Groups" ? 2 : 1
    }&Limit=30&SortType=3`
    return await GetAllPages(url, GetMarketInfo(CreatorType, CreatorID))
  }

Users.GetFollowers = async function (userId) {
  const url = `https://friends.roblox.com/v1/users/${userId}/followers?limit=100`
  const raw = await GetAllPages(url, entry => entry)

  const list = (
    await Promise.all(
      raw.map(async entry => {
        try {
          const res = await fetch(`https://users.roblox.com/v1/users/${entry.id}`)
          if (!res.ok) return null
          const d = await res.json()
          return {
            UserID: d.id,
            Username: d.name,
            DisplayName: d.displayName,
            Description: d.description,
            IsBanned: d.isBanned,
            IsVerified: d.hasVerifiedBadge,
            Created: d.created
          }
        } catch {
          return null
        }
      })
    )
  ).filter(Boolean)

  return {
    Count: list.length,
    List: list
  }
}

Users.GetFriends = async function (userId) {
  const url = `https://friends.roblox.com/v1/users/${userId}/friends?limit=100`
  const raw = await GetAllPages(url, entry => entry)

  const list = (
    await Promise.all(
      raw.map(async entry => {
        try {
          const res = await fetch(`https://users.roblox.com/v1/users/${entry.id}`)
          if (!res.ok) return null
          const d = await res.json()
          return {
            UserID: d.id,
            Username: d.name,
            DisplayName: d.displayName,
            Description: d.description,
            IsBanned: d.isBanned,
            IsVerified: d.hasVerifiedBadge,
            Created: d.created
          }
        } catch {
          return null
        }
      })
    )
  ).filter(Boolean)

  return {
    Count: list.length,
    List: list
  }
}

Users.GetBadges = async function (userId) {
  const url = `https://badges.roblox.com/v1/users/${userId}/badges?limit=100`
  const list = await GetAllPages(url, b => ({
    ID: b.id,
    Name: b.name,
    Description: b.description,
    AwardedDate: b.awardedDate,
    AwardedCount: b.statistics?.awardedCount ?? 0,
    WinRatePercentage: b.statistics?.winRatePercentage ?? null,
    Thumbnail: b.imageUrl ?? null
  }))

  return {
    Count: list.length,
    List: list
  }
}

export default Users
