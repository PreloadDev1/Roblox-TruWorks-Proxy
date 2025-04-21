import Games, { CreatorTypes } from "./GameService.mjs";
import Groups from "./GroupService.mjs";
import Users from "./UserService.mjs";

const PublicAssets = {};

PublicAssets.GetAll = async function (UserID) {
	const Result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: []
	};

	try {
		const UserGames = await Games.Get(UserID, CreatorTypes.User);
		const UserMerch = await Users.GetStoreAssets(UserID, 1, UserID);

		if (Array.isArray(UserMerch)) {
			Result.UserMerch.push(...UserMerch);
		}

		for (const Game of UserGames || []) {
			const PlaceID = Game.PlaceID;
			if (!PlaceID) continue;

			const Passes = await Games.GetPasses(PlaceID, CreatorTypes.User, UserID);
			if (Array.isArray(Passes)) {
				Result.UserPasses.push(...Passes);
			}
		}

		const GroupsList = await Groups.Get(UserID);

		for (const Group of GroupsList || []) {
			const GroupID = Group.ID;
			if (!GroupID) continue;

			const GroupMerch = await Users.GetStoreAssets(GroupID, 2, GroupID);
			if (Array.isArray(GroupMerch)) {
				Result.GroupMerch.push(...GroupMerch);
			}

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group);
			for (const Game of GroupGames || []) {
				const PlaceID = Game.PlaceID;
				if (!PlaceID) continue;

				const Passes = await Games.GetPasses(PlaceID, CreatorTypes.Group, GroupID);
				if (Array.isArray(Passes)) {
					Result.GroupPasses.push(...Passes);
				}
			}
		}

	} catch (err) {
		console.error("[PublicAssetsService:GetAll] Error:", err);
	}

	return Result;
};

export default PublicAssets;
