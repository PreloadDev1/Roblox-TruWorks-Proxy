import Groups from "./GroupService.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

const PublicAssetsService = {}

PublicAssetsService.GetPublicAssets = async function (UserID) {
	const UserPasses = []
	const UserMerch = []
	const GroupPasses = []
	const GroupMerch = []

	const GamesList = await Games.Get(UserID, CreatorTypes.User)
	const UserStore = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)

	for (const Game of GamesList) {
		if (!Game.PlaceID) continue

		const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID)
		UserPasses.push(...Passes)
	}

	UserMerch.push(...UserStore)

	const GroupsList = await Groups.Get(UserID)

	for (const Group of GroupsList) {
		const GroupID = Group.ID
		if (!GroupID) continue

		const GroupStore = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID)
		GroupMerch.push(...GroupStore)

		const GroupGames = await Games.Get(GroupID, CreatorTypes.Group)
		for (const Game of GroupGames) {
			if (!Game.PlaceID) continue

			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID)
			GroupPasses.push(...Passes)
		}
	}

	return {
		UserPasses,
		UserMerch,
		GroupPasses,
		GroupMerch
	}
}

export default PublicAssetsService
