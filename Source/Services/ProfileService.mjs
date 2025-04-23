import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

function ParseDate(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  return {
    Year:        d.getUTCFullYear(),
    Month:       d.getUTCMonth() + 1,
    Day:         d.getUTCDate(),
    Hour:        d.getUTCHours(),
    Minute:      d.getUTCMinutes(),
    Second:      d.getUTCSeconds(),
    Millisecond: d.getUTCMilliseconds()
  }
}

const ProfileService = {
  async GetBasicInfo(userId) {
    try {
      const res = await fetch(`https://users.roblox.com/v1/users/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch basic info")
      const d = await res.json()
      return {
        UserID:      d.id,
        Username:    d.name,
        DisplayName: d.displayName,
        Description: d.description,
        IsBanned:    d.isBanned,
        IsVerified:  d.hasVerifiedBadge,
        Created:     ParseDate(d.created)
      }
    } catch {
      return {
        UserID:      userId,
        Username:    null,
        DisplayName: null,
        Description: null,
        IsBanned:    false,
        IsVerified:  false,
        Created:     null
      }
    }
  },

  async GetSocialLinks(userId) {
    const res = await fetch(`https://users.roblox.com/v1/users/${userId}/social-links`)
    if (!res.ok) return []
    const d = await res.json()
    return d.data || []
  },

  async GetFollowers(userId) {
    return Users.GetFollowers(userId)
  },

  async GetFriends(userId) {
    return Users.GetFriends(userId)
  },

  async GetBadges(userId) {
    return Users.GetBadges(userId)
  },

  async GetDevProducts(userId) {
    const games = await Games.Get(userId, CreatorTypes.User)
    const all = []
    for (const g of games) {
      const prods = await Games.GetDevProducts(g.UniverseID, CreatorTypes.User, userId)
      if (Array.isArray(prods)) all.push(...prods)
    }
    return all
  },

  async GetFavoriteCounts(universeId) {
    const res = await fetch(`https://games.roblox.com/v1/games/${universeId}/votes`)
    if (!res.ok) return { Favourites: 0 }
    const d = await res.json()
    return { Favourites: d.favoritedCount || 0 }
  },

  async GetPublicAssets(userId) {
    const result = {
      UserPasses:   [],
      UserMerch:    [],
      GroupPasses:  [],
      GroupMerch:   [],
      DevProducts:  [],
      Games:        []
    }

    const userGames  = await Games.Get(userId, CreatorTypes.User)
    const userStore  = await Users.GetStoreAssets(userId, CreatorTypes.User, userId)
    const groupsList = await Groups.Get(userId)

    for (const game of userGames || []) {
      if (!game.UniverseID) continue
      const passes = await Games.GetPasses(game.UniverseID, CreatorTypes.User, userId)
      if (Array.isArray(passes)) result.UserPasses.push(...passes)

      const fav = await this.GetFavoriteCounts(game.UniverseID)
      game.Favourites = fav.Favourites

      const prods = await Games.GetDevProducts(game.UniverseID, CreatorTypes.User, userId)
      if (Array.isArray(prods)) result.DevProducts.push(...prods)

      result.Games.push(game)
    }

    if (Array.isArray(userStore)) {
      result.UserMerch.push(...userStore)
    }

    for (const group of groupsList || []) {
      const gid = group.ID
      if (!gid) continue

      const groupStore = await Users.GetStoreAssets(gid, CreatorTypes.Group, gid)
      if (Array.isArray(groupStore)) result.GroupMerch.push(...groupStore)

      const groupGames = await Games.Get(gid, CreatorTypes.Group)

      for (const game of groupGames || []) {
        if (!game.UniverseID) continue
        const passes = await Games.GetPasses(game.UniverseID, CreatorTypes.Group, gid)
        if (Array.isArray(passes)) result.GroupPasses.push(...passes)

        const fav = await this.GetFavoriteCounts(game.UniverseID)
        game.Favourites = fav.Favourites

        const prods = await Games.GetDevProducts(game.UniverseID, CreatorTypes.Group, gid)
        if (Array.isArray(prods)) result.DevProducts.push(...prods)

        result.Games.push(game)
      }
    }

    return result
  }
}

export default ProfileService
