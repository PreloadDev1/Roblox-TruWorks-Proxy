import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

const PublicAssetsService = {}

PublicAssetsService.GetPublicAssets = async function (UserID) {
	const Result = {
		UserPasses: [],
		GroupPasses: [],
		UserMerch: [],
		GroupMerch: []
	}

	try {
		const UserGames = await Games.Get(UserID, CreatorTypes.User)

		for (const Game of UserGames || []) {
			if (!Game.PlaceID) continue

			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID)
			if (Array.isArray(Passes)) Result.UserPasses.push(...Passes)
		}

		const UserItems = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)
		if (Array.isArray(UserItems)) Result.UserMerch.push(...UserItems)

		const GroupsList = await Groups.Get(UserID)

		for (const Group of GroupsList || []) {
			const GroupID = Group.ID
			if (!GroupID) continue

			const GroupItems = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)
			if (Array.isArray(GroupItems)) Result.GroupMerch.push(...GroupItems)

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group)

			for (const Game of GroupGames || []) {
				if (!Game.PlaceID) continue

				const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID)
				if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes)
			}
		}

	} catch (err) {
		console.error("[PublicAssetsService] Error:", err)
	}

	return Result
}

export default PublicAssetsService
