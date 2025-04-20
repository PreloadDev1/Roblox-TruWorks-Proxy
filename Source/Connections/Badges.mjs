import express from "express";
import Profile from "../Services/ProfileService.mjs";

const Router = express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const Result = await Profile.GetBadges(req.params.UserID);

		res.json({
			Count: Result.Count,
			List: Result.List
		});
	} catch (err) {
		console.error("[/badges/:UserID]", err);
		res.status(500).json({ error: "Failed to fetch badges" });
	}
});

export default Router;
