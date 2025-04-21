import Groups from "./GroupService.mjs";
import Games, { CreatorTypes } from "./GameService.mjs";
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
		const GamesList = await Games.Get(UserID, CreatorTypes.User);
		const UserMerch = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID);

		for (const Game of GamesList || []) {
			if (!Game.PlaceID) continue;

			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID);
			if (Array.isArray(Passes)) Result.UserPasses.push(...Passes);
		}

		if (Array.isArray(UserMerch)) {
			Result.UserMerch.push(...UserMerch);
		}

		const GroupsList = await Groups.Get(UserID);
		for (const Group of GroupsList || []) {
			const GroupID = Group.ID;
			if (!GroupID) continue;

			const GroupMerch = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);
			if (Array.isArray(GroupMerch)) Result.GroupMerch.push(...GroupMerch);

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group);
			for (const Game of GroupGames || []) {
				if (!Game.PlaceID) continue;

				const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID);
				if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes);
			}
		}
	} catch (Error) {
		console.error("[PublicAssetsService:GetAll]", Error);
	}

	return Result;
};

export default PublicAssets;
