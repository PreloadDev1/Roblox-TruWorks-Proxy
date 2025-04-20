import express from "express";
import getPublicAssets from "./main.mjs";
import getAvatarAssets from "./avatar.mjs";
import Games from "./games.mjs";
import Groups from "./groups.mjs";

const router = express.Router(); // ✅ Router, not app instance

// 🔹 Public assets for a user (games, passes, merch)
router.get("/avatar/:userId", async (req, res, next) => {
	try {
		const userId = parseInt(req.params.userId);
		if (isNaN(userId)) throw new Error("Invalid User ID");

		const data = await getAvatarAssets(userId);
		res.json(data);
	} catch (err) {
		console.error("[/avatar/:userId]", err);
		res.status(500).json({ error: "Failed to get avatar data" });
	}
});


// 🔹 Avatar data
router.get("/avatar/:userId", async (req, res) => {
	try {
		const result = await getAvatarAssets(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/avatar/:userId]", err);
		res.status(500).json({ error: "Failed to fetch avatar data" });
	}
});

// 🔹 User's games
router.get("/games/:userId", async (req, res) => {
	try {
		const result = await Games.get(req.params.userId, "Users");
		res.json(result);
	} catch (err) {
		console.error("[/games/:userId]", err);
		res.status(500).json({ error: "Failed to fetch games" });
	}
});

// 🔹 Groups owned by user
router.get("/groups/:userId", async (req, res) => {
	try {
		const result = await Groups.get(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/groups/:userId]", err);
		res.status(500).json({ error: "Failed to fetch groups" });
	}
});

export default router; // ✅ Must export router not app
