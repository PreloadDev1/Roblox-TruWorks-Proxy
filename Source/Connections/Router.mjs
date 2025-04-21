import Express from "express";
import GetPublicAssets from "./Main.mjs";
import GetAvatarAssets from "../Services/AvatarService.mjs";
import Games from "../Services/GameService.mjs";
import Groups from "../Services/GroupService.mjs";
import ProfileService from "../Services/ProfileService.mjs";

const Router = Express.Router();

Router.get("/avatar/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID);
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" });

		const AvatarData = await GetAvatarAssets(UserID);
		Response.json(AvatarData);

	} catch (Error) {
		console.error("[/avatar/:UserID]", Error);
		Response.status(500).json({ Error: "Failed to fetch avatar data" });
	}
});

Router.get("/games/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID);
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" });

		const GameList = await Games.Get(UserID, "Users");
		Response.json(GameList);

	} catch (Error) {
		console.error("[/games/:UserID]", Error);
		Response.status(500).json({ Error: "Failed to fetch games" });
	}
});

Router.get("/groups/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID);
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" });

		const GroupList = await Groups.Get(UserID);
		Response.json(GroupList);

	} catch (Error) {
		console.error("[/groups/:UserID]", Error);
		Response.status(500).json({ Error: "Failed to fetch groups" });
	}
});

Router.get("/profile/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID);
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" });

		const PublicAssets = await ProfileService.GetPublicAssets(UserID);
		Response.json(PublicAssets);

	} catch (Error) {
		console.error("[/profile/:UserID]", Error);
		Response.status(500).json({ Error: "Failed to fetch profile data" });
	}
});

export default Router;
