import GetAllPages from "../Utilities/GetAllPages.mjs"
import { GetMarketInfo } from "../Utilities/FilterJson.mjs"

function ParseDate(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  return {
    Year: d.getUTCFullYear(),
    Month: d.getUTCMonth() + 1,
    Day: d.getUTCDate(),
    Hour: d.getUTCHours(),
    Minute: d.getUTCMinutes(),
    Second: d.getUTCSeconds(),
    Millisecond: d.getUTCMilliseconds()
  }
}

const Users = {}

Users.GetStoreAssets = async function (TargetID, CreatorType, CreatorID) {
  const url = `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${TargetID}&CreatorType=${CreatorType === "Groups" ? 2 : 1}&Limit=30&SortType=3`
  return await GetAllPages(url, GetMarketInfo(CreatorType, CreatorID))
}

Users.GetFollowers = async function (UserID) {
  const url = `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`
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
            Created: ParseDate(d.created)
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

Users.GetFriends = async function (UserID) {
  const url = `https://friends.roblox.com/v1/users/${UserID}/friends?limit=100`
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
            Created: ParseDate(d.created)
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

Users.GetBadges = async function (UserID) {
  const url = `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100`
  const list = await GetAllPages(url, badge => ({
    ID: badge.id,
    Name: badge.name,
    Description: badge.description,
    Created: ParseDate(badge.awardedDate),
    AwardedCount: badge.statistics?.awardedCount ?? 0,
    WinRatePercentage: badge.statistics?.winRatePercentage ?? null,
    Thumbnail: badge.imageUrl ?? null
  }))

  return {
    Count: list.length,
    List: list
  }
}

export default Users
