import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

export default async function getPublicAssets(userId) {
  const result = {
    UserPasses: [],
    UserMerch:  [],
    GroupPasses: [],
    GroupMerch:  []
  }

  try {
    const userGames = await Games.Get(userId, CreatorTypes.User)
    for (const g of userGames) {
      if (!g.PlaceID) continue
      const passes = await Games.GetPasses(g.PlaceID, CreatorTypes.User, userId)
      if (Array.isArray(passes)) result.UserPasses.push(...passes)
    }

    const userMerch = await Users.GetStoreAssets(userId, CreatorTypes.User, userId)
    if (Array.isArray(userMerch)) result.UserMerch.push(...userMerch)

    const groups = await Groups.Get(userId)
    for (const grp of groups) {
      const gid = grp.ID
      if (!gid) continue

      const merch = await Users.GetStoreAssets(gid, CreatorTypes.Group, gid)
      if (Array.isArray(merch)) result.GroupMerch.push(...merch)

      const groupGames = await Games.Get(gid, CreatorTypes.Group)
      for (const g of groupGames) {
        if (!g.PlaceID) continue
        const passes = await Games.GetPasses(g.PlaceID, CreatorTypes.Group, gid)
        if (Array.isArray(passes)) result.GroupPasses.push(...passes)
      }
    }
  } catch (err) {
    console.error("[PublicAssetsService] getPublicAssets failed:", err)
  }

  return result
}
