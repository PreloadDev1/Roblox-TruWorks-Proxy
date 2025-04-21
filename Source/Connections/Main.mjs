import Groups from "../Services/GroupService.mjs"
import Games, { CreatorTypes } from "../Services/GameService.mjs"
import Users from "../Services/UserService.mjs"

export default async function GetPublicAssets(UserID) {
	const Result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: []
	}

	try {
		const GamesList = await Games.Get(UserID, CreatorTypes.User)
		const UserStore = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID)

		for (const Game of GamesList || []) {
			if (!Game.PlaceID) continue

			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID)
			if (Array.isArray(Passes)) Result.UserPasses.push(...Passes)
		}

		if (Array.isArray(UserStore)) {
			Result.UserMerch.push(...UserStore)
		}

		const GroupsList = await Groups.Get(UserID)

		for (const Group of GroupsList || []) {
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
	} catch (Error) {
		console.error("[GetPublicAssets] Error:", Error)
	}

	return Result
}
