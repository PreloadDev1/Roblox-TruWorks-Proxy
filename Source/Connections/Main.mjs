import Groups from "../Services/GroupService.mjs";
import Games, { CreatorTypes } from "../Services/GameService.mjs";
import Users from "../Services/UserService.mjs";

async function GetPublicAssets(UserID) {
	const Result = {
		UserPasses: [],
		UserMerch: [],
		GroupPasses: [],
		GroupMerch: [],
	};

	try {
		const UserGames = await Games.Get(UserID, CreatorTypes.User);
		console.log(`[UserGames] ${UserGames.length} games found`);

		for (const Game of UserGames) {
			if (!Game.UniverseID) continue;
			const Passes = await Games.GetPasses(Game.UniverseID, CreatorTypes.User, UserID);
			if (Array.isArray(Passes)) {
				Result.UserPasses.push(...Passes);
			}
		}

		const UserItems = await Users.GetStoreAssets(UserID, CreatorTypes.User, UserID);
		if (Array.isArray(UserItems)) {
			Result.UserMerch.push(...UserItems);
		}

		const GroupsOwned = await Groups.Get(UserID);
		console.log(`[UserGroups] ${GroupsOwned.length} groups found`);

		for (const Group of GroupsOwned) {
			const GroupID = Group.ID;
			if (!GroupID) continue;

			const GroupItems = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);
			if (Array.isArray(GroupItems)) {
				Result.GroupMerch.push(...GroupItems);
			}

			const GroupGames = await Games.Get(GroupID, CreatorTypes.Group);
			for (const Game of GroupGames) {
				if (!Game.UniverseID) continue;
				const Passes = await Games.GetPasses(Game.UniverseID, CreatorTypes.Group, GroupID);
				if (Array.isArray(Passes)) {
					Result.GroupPasses.push(...Passes);
				}
			}
		}

	} catch (err) {
		console.error("[TruWorks:GetPublicAssets] Error:", err);
	}

	return Result;
}

export default GetPublicAssets;
