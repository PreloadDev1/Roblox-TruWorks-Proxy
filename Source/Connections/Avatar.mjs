import Express from "express";
import GetAvatarAssets from "../Services/AvatarService.mjs";

const Router = Express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const Assets = await GetAvatarAssets(UserID);
		res.json(Assets);
	} catch (err) {
		console.error("[/avatar/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch avatar assets" });
	}
});

export default Router;
