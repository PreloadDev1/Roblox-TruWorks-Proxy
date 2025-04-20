import express from "express";
import Profile from "./profile.mjs"; // or wherever your logic lives

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const data = await Profile.getBasicInfo(userId); // or whatever data you want
		res.json(data);
	} catch (err) {
		console.error("[/developer/:userId]", err);
		res.status(500).json({ error: "Failed to fetch developer data" });
	}
});

export default router;
