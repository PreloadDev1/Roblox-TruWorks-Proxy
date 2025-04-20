import express from "express";
import filterJSON, { getIdentificationInfo } from "../utils/filterjson.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	const userId = Number(req.params.userId);
	if (!userId) return res.status(400).json({ error: "Invalid userId" });

	try {
		const followers = await filterJSON({
			url: `https://friends.roblox.com/v1/users/${userId}/followers?limit=100`,
			exhaust: true,
			filter: getIdentificationInfo
		});

		res.json(followers);
	} catch (err) {
		console.error("Followers error:", err);
		res.status(500).json({ error: "Failed to fetch followers" });
	}
});

export default router;

