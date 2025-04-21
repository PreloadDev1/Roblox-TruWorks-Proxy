import Express from "express";
import GetPublicAssets from "./Main.mjs";
import GetAvatarAssets from "../Services/AvatarService.mjs";
import Games from "../Services/GameService.mjs";
import Groups from "../Services/GroupService.mjs";
import ProfileService from "../Services/ProfileService.mjs";

const Router = Express.Router();

Router.get("/avatar/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const AvatarData = await GetAvatarAssets(UserID);
		res.json(AvatarData);
	} catch (err) {
		console.error("[/avatar/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch avatar data" });
	}
});

Router.get("/games/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const GameList = await Games.Get(UserID, "Users");
		res.json(GameList);
	} catch (err) {
		console.error("[/games/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch games" });
	}
});

Router.get("/groups/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const GroupList = await Groups.Get(UserID);
		res.json(GroupList);
	} catch (err) {
		console.error("[/groups/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch groups" });
	}
});

Router.get("/profile/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const Profile = await ProfileService.GetPublicAssets(UserID);
		res.json(Profile);
	} catch (err) {
		console.error("[/profile/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch profile data" });
	}
});

export default Router;
