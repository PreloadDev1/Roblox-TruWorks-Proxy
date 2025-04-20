import express from "express";
import GetAvatarAssets from "../Services/AvatarService.mjs";

const Router = express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);

		if (isNaN(UserID)) {
			return res.status(400).json({ error: "Invalid User ID" });
		}

		const Assets = await GetAvatarAssets(UserID);
		res.json(Assets);
	} catch (err) {
		console.error("[/avatar/:UserID]", err);
		res.status(500).json({ error: "Failed to fetch avatar assets" });
	}
});

export default Router;
