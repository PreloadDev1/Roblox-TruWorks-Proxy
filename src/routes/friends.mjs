// src/routes/friends.mjs
import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const data = await Profile.getFriends(userId);

		res.json({
			Count: data.count,
			List: data.list
		});
	} catch (err) {
		console.error("[/friends/:userId]", err);
		res.status(500).json({ error: "Failed to fetch friends" });
	}
});

export default router;
