import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const result = await Profile.getBadges(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/badges/:userId]", err);
		res.status(500).json({ error: "Failed to fetch badges" });
	}
});

export default router;
