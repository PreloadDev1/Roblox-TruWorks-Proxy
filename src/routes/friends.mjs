// src/routes/friends.mjs
import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const result = await Profile.getFriends(req.params.userId);
		res.json({
			Count: result.Count,
			List: result.List
		});
	} catch (err) {
		console.error("[/friends/:userId]", err);
		res.status(500).json({ error: "Failed to fetch friends" });
	}
});

export default router;
