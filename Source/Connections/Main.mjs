import Express from "express";
import Groups from "../Services/GroupService.mjs";
import Games, { CreatorTypes } from "../Services/GameService.mjs";
import Users from "../Services/UserService.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";

const Router = Express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const Result = {
			UserPasses: [],
			UserMerch: [],
			GroupPasses: [],
			GroupMerch: [],
		};

		const UserGames = await Games.Get(UserID, CreatorTypes.User);
		for (const Game of UserGames || []) {
			if (!Game.UniverseID) continue;
			const Passes = await Games.GetPasses(Game.UniverseID, CreatorTypes.User, UserID);
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
			for (const Game of GroupGames || []) {
				if (!Game.UniverseID) continue;
				const Passes = await Games.GetPasses(Game.UniverseID, CreatorTypes.Group, GroupID);
				if (Array.isArray(Passes)) Result.GroupPasses.push(...Passes);
			}
		}

		res.json(ToPascalCaseObject(Result));
	} catch (err) {
		console.error("[/main/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch public assets" });
	}
});

export default Router;
