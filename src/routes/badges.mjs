import express from "express";
import filterJSON from "../utils/filterjson.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	const userId = Number(req.params.userId);
	if (!userId) return res.status(400).json({ error: "Invalid userId" });

	try {
		const badges = await filterJSON({
			url: `https://badges.roblox.com/v1/users/${userId}/badges?limit=100`,
			exhaust: true,
			filter: (badge) => ({
				ID: badge.id,
				Name: badge.name,
				Description: badge.description,
				AwardedDate: badge.awardedDate,
				Icon: badge.imageUrl,
			}),
		});

		res.json(badges);
	} catch (err) {
		console.error("Badges error:", err);
		res.status(500).json({ error: "Failed to fetch badges" });
	}
});

export default router;

