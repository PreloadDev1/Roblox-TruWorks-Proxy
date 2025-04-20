// src/routes/badges.mjs
import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const data = await Profile.getBadges(userId);

		res.json({
			Count: data.count,
			List: data.list
		});
	} catch (err) {
		console.error("[/badges/:userId]", err);
		res.status(500).json({ error: "Failed to fetch badges" });
	}
});

export default router;
