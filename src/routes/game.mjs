// src/routes/game.mjs
import express from "express";
import Games from "./games.mjs";

const router = express.Router();

router.get("/:universeId", async (req, res) => {
	try {
		const universeId = req.params.universeId;
		const game = await Games.getGame(universeId);

		if (!game) {
			return res.status(404).json({ error: "Game not found" });
		}

		res.json(game);
	} catch (err) {
		console.error("[/game/:universeId]", err);
		res.status(500).json({ error: "Failed to fetch game" });
	}
});

export default router;
