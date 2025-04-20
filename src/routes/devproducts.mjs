import express from "express";
import Games, { CreatorTypes } from "../routes/games.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	const userId = Number(req.params.userId);
	if (!userId) return res.status(400).json({ error: "Invalid userId" });

	try {
		const games = await Games.get(userId, CreatorTypes.User);
		const allProducts = [];

		for (const game of games) {
			const devProducts = await Games.getDevProducts(game.UniverseID, CreatorTypes.User, userId);
			allProducts.push(...devProducts);
		}

		res.json(allProducts);
	} catch (err) {
		console.error("DevProducts error:", err);
		res.status(500).json({ error: "Failed to fetch dev products" });
	}
});

export default router;

