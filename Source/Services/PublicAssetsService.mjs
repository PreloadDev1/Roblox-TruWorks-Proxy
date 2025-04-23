import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"

async function GetAll(UserId) {
  const Result = {
    UserPasses: [],
    UserMerch: [],
    GroupPasses: [],
    GroupMerch: []
  }

  const UserGames = await Games.Get(UserId, CreatorTypes.User)
  for (const Game of UserGames) {
    if (!Game.UniverseID) continue
    const Passes = await Games.GetPasses(Game.UniverseID, CreatorTypes.User, UserId)
    if (Array.isArray(Passes)) Result.UserPasses.push(...Passes)
  }

  const GroupsList = await Groups.Get(UserId)
  for (const Group of GroupsList) {
    const GroupId = Group.ID
    if (!GroupId) continue

    const GroupGames = await Games.Get(GroupId, CreatorTypes.Group)
    for (const Game of GroupGames) {
      if (!Game.UniverseID) continue
      const Passes = await Games.GetPasses(Game.UniverseID, CreatorTypes.Group, GroupId)
      if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes)
    }

    const GroupMerch = await Groups.GetStoreAssets(GroupId)
    if (Array.isArray(GroupMerch)) Result.GroupMerch.push(...GroupMerch)
  }

  return Result
}

export default { GetAll }
