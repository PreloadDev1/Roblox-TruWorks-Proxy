import Games, { CreatorTypes } from "./GameService.mjs"
import Groups from "./GroupService.mjs"
import Users from "./UserService.mjs"

const PublicAssets = {}

PublicAssets.GetPublicAssets = async function (UserID) {
	const Result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: []
	}

	try {
		const UserGames = await Games.Get(UserID, CreatorTypes.User)
		const UserStore = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)

		for (const Game of UserGames || []) {
			if (!Game.PlaceID) continue
			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID)
			if (Array.isArray(Passes)) Result.UserPasses.push(...Passes)
		}

		if (Array.isArray(UserStore)) {
			Result.UserMerch.push(...UserStore)
		}

		const UserGroups = await Groups.Get(UserID)
		for (const Group of UserGroups || []) {
			const GroupID = Group.ID
			if (!GroupID) continue

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group)
			const GroupStore = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)

			for (const Game of GroupGames || []) {
				if (!Game.PlaceID) continue
				const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID)
				if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes)
			}

			if (Array.isArray(GroupStore)) {
				Result.GroupMerch.push(...GroupStore)
			}
		}
	} catch (err) {
		console.error("[PublicAssets.GetPublicAssets] Error:", err)
	}

	return Result
}

export default PublicAssets
