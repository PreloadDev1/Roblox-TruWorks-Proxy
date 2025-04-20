import express from "express";
import Profile from "../services/profile.mjs"; // or ../controllers/profile.mjs

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = parseInt(req.params.userId);
		if (isNaN(userId)) return res.status(400).json({ error: "Invalid User ID" });

		const profile = await Profile.getPublicAssets(userId);
		res.json(profile);
	} catch (err) {
		console.error("[/profile/:userId] Error fetching profile:", err);
		res.status(500).json({ error: "Failed to fetch profile data" });
	}
});

export default router;
