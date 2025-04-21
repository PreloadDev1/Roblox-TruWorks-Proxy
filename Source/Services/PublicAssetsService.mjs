import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

const PublicAssetsService = {}

PublicAssetsService.GetPublicAssets = async function (userId) {
  const result = {
    UserPasses: [],
    UserMerch: [],
    GroupPasses: [],
    GroupMerch: []
  }

  try {
    // user game passes
    const userGames = await Games.Get(userId, CreatorTypes.User)

    for (const game of userGames) {
      if (!game.UniverseID) continue
      const passes = await Games.GetPasses(game.UniverseID, CreatorTypes.User, userId)
      if (Array.isArray(passes)) result.UserPasses.push(...passes)
    }

    // user created merch
    const userMerch = await Users.GetStoreAssets(userId, CreatorTypes.User, userId)
    if (Array.isArray(userMerch)) result.UserMerch.push(...userMerch)

    // each group’s merch & passes
    const userGroups = await Groups.Get(userId)

    for (const group of userGroups) {
      const groupId = group.ID
      if (!groupId) continue

      const merch = await Users.GetStoreAssets(groupId, CreatorTypes.Group, groupId)
      if (Array.isArray(merch)) result.GroupMerch.push(...merch)

      const groupGames = await Games.Get(groupId, CreatorTypes.Group)
      for (const game of groupGames) {
        if (!game.UniverseID) continue
        const passes = await Games.GetPasses(game.UniverseID, CreatorTypes.Group, groupId)
        if (Array.isArray(passes)) result.GroupPasses.push(...passes)
      }
    }
  } catch (err) {
    console.error("[PublicAssetsService.GetPublicAssets] Error", err)
  }

  return result
}

export default PublicAssetsService
