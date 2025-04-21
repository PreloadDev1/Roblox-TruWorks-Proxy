import Groups from "../Services/GroupService.mjs";
import Games, { CreatorTypes } from "../Services/GameService.mjs";
import Users from "../Services/UserService.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";

export default async function GetPublicAssets(UserID) {
	const Result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: [],
	};

	try {
		const UserGames = await Games.Get(UserID, CreatorTypes.User);

		for (const Game of UserGames) {
			if (!Game.PlaceID) continue;

			const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.User, UserID);
			if (Array.isArray(Passes)) Result.UserPasses.push(...Passes);
		}

		const UserItems = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID);
		if (Array.isArray(UserItems)) Result.UserMerch.push(...UserItems);

		const GroupsList = await Groups.Get(UserID);
		for (const Group of GroupsList || []) {
			const GroupID = Group.ID;
			if (!GroupID) continue;

			const GroupItems = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);
			if (Array.isArray(GroupItems)) Result.GroupMerch.push(...GroupItems);

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group);
			for (const Game of GroupGames) {
				if (!Game.PlaceID) continue;

				const Passes = await Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID);
				if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes);
			}
		}

	} catch (Error) {
		console.error("[Main:GetPublicAssets] Failed:", Error);
	}

	return ToPascalCaseObject(Result);
}
