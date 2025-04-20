// src/routes/devproducts.mjs
import express from "express";
import Games, { CreatorTypes } from "./games.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const userGames = await Games.get(userId, CreatorTypes.User);

		const allDevProducts = (await Promise.all(
			userGames.map(game =>
				Games.getDevProducts(game.UniverseID, CreatorTypes.User, userId)
			)
		)).flat();

		res.json(allDevProducts);
	} catch (err) {
		console.error("[/devproducts/:userId]", err);
		res.status(500).json({ error: "Failed to fetch dev products" });
	}
});

export default router;
