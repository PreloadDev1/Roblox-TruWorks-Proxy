// src/routes/groups.mjs

import express from "express";
import Groups from "../services/groups.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = parseInt(req.params.userId);
		if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

		const groups = await Groups.get(userId);
		res.json(groups);
	} catch (err) {
		console.error("[/groups/:userId]", err);
		res.status(500).json({ error: "Failed to fetch groups" });
	}
});

export default router;
