import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

const PublicAssetsService = {}

PublicAssetsService.GetPublicAssets = async function (UserID) {
	const Result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: []
	}

	try {
		const UserGames = await Games.Get(UserID, CreatorTypes.User)

		for (const Game of UserGames || []) {
			if (!Game.PlaceID) continue

			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID)
			if (Array.isArray(Passes)) Result.UserPasses.push(...Passes)
		}

		const UserStore = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)
		if (Array.isArray(UserStore)) Result.UserMerch.push(...UserStore)

		const UserGroups = await Groups.Get(UserID)

		for (const Group of UserGroups || []) {
			const GroupID = Group.ID
			if (!GroupID) continue

			const GroupStore = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)
			if (Array.isArray(GroupStore)) Result.GroupMerch.push(...GroupStore)

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group)
			for (const Game of GroupGames || []) {
				if (!Game.PlaceID) continue

				const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID)
				if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes)
			}
		}
	} catch (err) {
		console.error("[PublicAssetsService.GetPublicAssets]", err)
	}

	return Result
}

export default PublicAssetsService
