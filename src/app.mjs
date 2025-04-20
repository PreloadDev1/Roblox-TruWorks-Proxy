import express from "express";
import getPublicAssets from "./main.mjs";
import getAvatarAssets from "./avatar.mjs";
import Games from "./games.mjs";
import Groups from "./groups.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Public assets for a user (games, passes, merch)
app.get("/assets/:userId", async (req, res) => {
	try {
		const result = await getPublicAssets(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/assets/:userId]", err);
		res.status(500).json({ error: "Failed to fetch public assets" });
	}
});

// 🔹 Avatar data
app.get("/avatar/:userId", async (req, res) => {
	try {
		const result = await getAvatarAssets(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/avatar/:userId]", err);
		res.status(500).json({ error: "Failed to fetch avatar data" });
	}
});

// 🔹 User's games
app.get("/games/:userId", async (req, res) => {
	try {
		const result = await Games.get(req.params.userId, "Users");
		res.json(result);
	} catch (err) {
		console.error("[/games/:userId]", err);
		res.status(500).json({ error: "Failed to fetch games" });
	}
});

// 🔹 Groups owned by user
app.get("/groups/:userId", async (req, res) => {
	try {
		const result = await Groups.get(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/groups/:userId]", err);
		res.status(500).json({ error: "Failed to fetch groups" });
	}
});

app.listen(PORT, () => {
	console.log("✅ Proxy running on port", PORT);
});
