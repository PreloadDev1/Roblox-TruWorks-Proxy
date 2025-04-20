// src/routes/app.mjs
import express from "express";
import getPublicAssets from "./main.mjs";
import getAvatarAssets from "../services/avatar.mjs"; // ✅ correct
import Games from "../services/games.mjs";             // ✅ fix: from services
import Groups from "../services/groups.mjs";           // ✅ fix: from services

const router = express.Router();

// 🔹 Avatar assets (used on character pages)
router.get("/avatar/:userId", async (req, res) => {
	try {
		const result = await getAvatarAssets(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/avatar/:userId]", err);
		res.status(500).json({ error: "Failed to fetch avatar data" });
	}
});

// 🔹 User games
router.get("/games/:userId", async (req, res) => {
	try {
		const result = await Games.get(req.params.userId, "Users");
		res.json(result);
	} catch (err) {
		console.error("[/games/:userId]", err);
		res.status(500).json({ error: "Failed to fetch games" });
	}
});

// 🔹 User groups
router.get("/groups/:userId", async (req, res) => {
	try {
		const result = await Groups.get(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/groups/:userId]", err);
		res.status(500).json({ error: "Failed to fetch groups" });
	}
});

export default router;
