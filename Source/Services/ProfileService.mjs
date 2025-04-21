import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"
import PublicAssets from "./PublicAssetsService.mjs"

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

class Profile {
  static async GetBasicInfo(userID) {
    const res = await fetch(`https://users.roblox.com/v1/users/${userID}`)
    if (!res.ok) throw new Error("Failed to fetch basic info")
    const data = await res.json()
    return {
      UserID: data.id,
      Username: data.name,
      DisplayName: data.displayName,
      Description: data.description,
      IsBanned: data.isBanned,
      IsVerified: data.hasVerifiedBadge,
      Created: ParseDate(data.created)
    }
  }

  static async GetSocialLinks(userID) {
    const res = await fetch(`https://users.roblox.com/v1/users/${userID}/social-links`)
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  }

  static async GetFavoriteCounts(universeID) {
    const res = await fetch(`https://games.roblox.com/v1/games/${universeID}/votes`)
    if (!res.ok) return { Favourites: 0 }
    const data = await res.json()
    return { Favourites: data.favoritedCount || 0 }
  }

  static async GetDevProducts(userID) {
    const games = await Games.Get(userID, CreatorTypes.User)
    const all = []
    for (const g of games) {
      const prods = await Games.GetDevProducts(g.UniverseID, CreatorTypes.User, userID)
      all.push(...prods)
    }
    return all
  }

  static async GetBadges(userID) {
    return Users.GetBadges(userID)
  }

  static async GetFollowers(userID) {
    return Users.GetFollowers(userID)
  }

  static async GetFriends(userID) {
    return Users.GetFriends(userID)
  }

  static async GetPublicAssets(userID) {
    const base = {
      UserID: userID,
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
      BadgeCount: 0,
      Badges: [],
      SocialLinks: [],
      UserPasses: [],
      UserMerch: [],
      GroupPasses: [],
      GroupMerch: [],
      DevProducts: [],
      Games: []
    }

    const [
      basic,
      followers,
      friends,
      badges,
      socials,
      games,
      groups,
      assets
    ] = await Promise.all([
      Profile.GetBasicInfo(userID),
      Profile.GetFollowers(userID),
      Profile.GetFriends(userID),
      Profile.GetBadges(userID),
      Profile.GetSocialLinks(userID),
      Games.Get(userID, CreatorTypes.User),
      Groups.Get(userID),
      PublicAssets.GetAll(userID)
    ])

    Object.assign(base, basic)

    base.FollowerCount = followers.Count
    base.Followers = followers.List

    base.FriendsCount = friends.Count
    base.Friends = friends.List

    base.BadgeCount = badges.Count
    base.Badges = badges.List

    base.SocialLinks = socials

    base.UserPasses = assets.UserPasses
    base.UserMerch = assets.UserMerch
    base.GroupPasses = assets.GroupPasses
    base.GroupMerch = assets.GroupMerch

    for (const g of games) {
      const fav = await Profile.GetFavoriteCounts(g.UniverseID)
      g.Favourites = fav.Favourites
      base.Games.push(g)
    }

    return base
  }
}

export default Profile
