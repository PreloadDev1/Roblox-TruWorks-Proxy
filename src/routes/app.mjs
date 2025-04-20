import express from "express";
const router = express.Router();

import getPublicAssets from "./main.mjs";
import getAvatarAssets from "./avatar.mjs";
import Games from "./games.mjs";
import Groups from "./groups.mjs";

// 🔹 Public assets
router.get("/assets/:userId", async (req, res) => {
	// ...
});

// 🔹 Avatar
router.get("/avatar/:userId", async (req, res) => {
	// ...
});

// 🔹 Games
router.get("/games/:userId", async (req, res) => {
	// ...
});

// 🔹 Groups
router.get("/groups/:userId", async (req, res) => {
	// ...
});

export default router;
