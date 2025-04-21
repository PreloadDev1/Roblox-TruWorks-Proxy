import Games, { CreatorTypes } from "./GameService.mjs"
import Groups from "./GroupService.mjs"
import Users from "./UserService.mjs"

class PublicAssets {
  static async GetAll(userID) {
    const result = {
      UserPasses: [],
      UserMerch: [],
      GroupPasses: [],
      GroupMerch: []
    }

    const games = await Games.Get(userID, CreatorTypes.User)
    const store = await Users.GetStoreAssets(userID, CreatorTypes.User, userID)

    for (const g of games) {
      const passes = await Games.GetPasses(g.PlaceID, CreatorTypes.User, userID)
      result.UserPasses.push(...passes)
    }

    result.UserMerch.push(...store)

    const groups = await Groups.Get(userID)

    for (const grp of groups) {
      const merch = await Users.GetStoreAssets(grp.ID, CreatorTypes.Group, grp.ID)
      result.GroupMerch.push(...merch)

      const gg = await Games.Get(grp.ID, CreatorTypes.Group)
      for (const g of gg) {
        const passes = await Games.GetPasses(g.PlaceID, CreatorTypes.Group, grp.ID)
        result.GroupPasses.push(...passes)
      }
    }

    return result
  }
}

export default PublicAssets
