// src/routes/avatar.mjs
import express from "express";

const router = express.Router();

// Get user-created outfits (custom characters)
async function getAvatarAssets(userId) {
	const res = await fetch(`https://avatar.roblox.com/v1/users/${userId}/outfits`);
	if (!res.ok) return [];

	const { data } = await res.json();
	if (!Array.isArray(data)) return [];

	// Only return ID, Name, and Thumbnail
	const outfits = await Promise.all(data.map(async (outfit) => {
		const { id, name } = outfit;

		// Attempt to get a thumbnail
		let thumb = null;
		try {
			const res = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=150x150&format=Png`);
			const json = await res.json();
			thumb = json?.data?.[0]?.imageUrl || null;
		} catch {}

		return {
			ID: id,
			Name: name,
			Thumbnail: thumb
		};
	}));

	return outfits;
}

router.get("/:userId", async (req, res) => {
	try {
		const avatarData = await getAvatarAssets(req.params.userId);
		res.json({
			Count: avatarData.length,
			List: avatarData
		});
	} catch (err) {
		console.error("[/avatar/:userId]", err);
		res.status(500).json({ error: "Failed to fetch avatar data" });
	}
});

export default router;
