import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"
import Groups from "./GroupService.mjs"

export default async function GetPublicAssets(UserID) {
  const Result = {
    UserPasses: [],
    UserMerch: [],
    GroupPasses: [],
    GroupMerch: []
  }

  // User games → passes
  const UserGames = await Games.Get(UserID, CreatorTypes.User)
  for (const game of UserGames || []) {
    const placeId = game.PlaceID
    if (!placeId) continue

    const passes = await Games.GetPasses(placeId, CreatorTypes.User, UserID)
    if (Array.isArray(passes)) {
      Result.UserPasses.push(...passes)
    }
  }

  // User merch
  const userMerch = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)
  if (Array.isArray(userMerch)) {
    Result.UserMerch.push(...userMerch)
  }

  // Groups → merch & passes
  const GroupList = await Groups.Get(UserID)
  for (const grp of GroupList || []) {
    const groupId = grp.ID
    if (!groupId) continue

    const merch = await Users.GetStoreAssets(groupId, CreatorTypes.Group, groupId)
    if (Array.isArray(merch)) {
      Result.GroupMerch.push(...merch)
    }

    const GroupGames = await Games.Get(groupId, CreatorTypes.Group)
    for (const game of GroupGames || []) {
      const placeId = game.PlaceID
      if (!placeId) continue

      const passes = await Games.GetPasses(placeId, CreatorTypes.Group, groupId)
      if (Array.isArray(passes)) {
        Result.GroupPasses.push(...passes)
      }
    }
  }

  return Result
}
