import express from "express";
import Profile from "../Services/ProfileService.mjs";

const Router = express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const Result = await Profile.GetFollowers(req.params.UserID);

		res.json({
			Count: Result.Count,
			List: Result.List
		});
	} catch (err) {
		console.error("[/followers/:UserID]", err);
		res.status(500).json({ error: "Failed to fetch followers" });
	}
});

export default Router;
