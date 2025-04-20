import express from "express";
import GetAvatarAssets from "../Services/AvatarService.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = parseInt(req.params.userId);
		if (isNaN(userId)) {
			return res.status(400).json({ error: "Invalid user ID" });
		}

		const assets = await GetAvatarAssets(userId);
		res.json(assets);
	} catch (err) {
		console.error("[/avatar/:userId]", err);
		res.status(500).json({ error: "Failed to fetch avatar assets" });
	}
});

export default router;
