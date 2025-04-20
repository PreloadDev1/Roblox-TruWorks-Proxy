// src/routes/thumbnails.mjs
import express from "express";
const router = express.Router();

/**
 * Gets a game thumbnail from Universe ID.
 */
export async function getThumbnail(universeId) {
	const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
	if (!res.ok) return null;

	const data = await res.json();
	const found = data?.data?.find(t => t.targetId === Number(universeId));
	return found?.imageUrl || null;
}

// Optional route for testing thumbnail API
router.get("/game/:universeId", async (req, res) => {
	const thumbnail = await getThumbnail(req.params.universeId);
	if (thumbnail) {
		res.json({ thumbnail });
	} else {
		res.status(404).json({ error: "Thumbnail not found" });
	}
});

export default router;
