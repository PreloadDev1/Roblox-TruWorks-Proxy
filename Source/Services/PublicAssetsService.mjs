import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

export default async function GetPublicAssets(UserId) {
    const Result = {
        UserPasses:   [],
        UserMerch:    [],
        GroupPasses:  [],
        GroupMerch:   []
    }

    const UserGames  = await Games.Get(UserId, CreatorTypes.User)
    const UserStore  = await Users.GetStoreAssets(UserId, CreatorTypes.User, UserId)
    const UserGroups = await Groups.Get(UserId)

    for (const Game of UserGames) {
        if (!Game.PlaceID) continue
        const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserId)
        if (Array.isArray(Passes)) Result.UserPasses.push(...Passes)
    }

    if (Array.isArray(UserStore)) {
        Result.UserMerch.push(...UserStore)
    }

    for (const Group of UserGroups) {
        const GroupId = Group.ID
        if (!GroupId) continue

        const GroupStore = await Users.GetStoreAssets(GroupId, CreatorTypes.Group, GroupId)
        if (Array.isArray(GroupStore)) {
            Result.GroupMerch.push(...GroupStore)
        }

        const GroupGames = await Games.Get(GroupId, CreatorTypes.Group)
        for (const Game of GroupGames) {
            if (!Game.PlaceID) continue
            const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupId)
            if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes)
        }
    }

    return Result
}
