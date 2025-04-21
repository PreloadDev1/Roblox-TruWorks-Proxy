import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"
import Groups from "./GroupService.mjs"

const PublicAssetsService = {}

PublicAssetsService.GetAll = async function (UserID) {
  const Result = {
    UserPasses: [],
    UserMerch: [],
    GroupPasses: [],
    GroupMerch: []
  }

  const UserGames = await Games.Get(UserID, CreatorTypes.User)
  for (const Game of UserGames || []) {
    const PlaceID = Game.PlaceID
    if (!PlaceID) continue

    const Passes = await Games.GetPasses(PlaceID, CreatorTypes.User, UserID)
    if (Array.isArray(Passes)) {
      Result.UserPasses.push(...Passes)
    }
  }

  const UserMerch = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)
  if (Array.isArray(UserMerch)) {
    Result.UserMerch.push(...UserMerch)
  }

  const GroupList = await Groups.Get(UserID)
  for (const Group of GroupList || []) {
    const GroupID = Group.ID
    if (!GroupID) continue

    const Merch = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)
    if (Array.isArray(Merch)) {
      Result.GroupMerch.push(...Merch)
    }

    const GroupGames = await Games.Get(GroupID, CreatorTypes.Group)
    for (const Game of GroupGames || []) {
      const PlaceID = Game.PlaceID
      if (!PlaceID) continue

      const Passes = await Games.GetPasses(PlaceID, CreatorTypes.Group, GroupID)
      if (Array.isArray(Passes)) {
        Result.GroupPasses.push(...Passes)
      }
    }
  }

  return Result
}

export default PublicAssetsService
