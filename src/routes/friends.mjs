import express from "express";
import filterJSON, { getIdentificationInfo } from "../utils/filterjson.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	const userId = Number(req.params.userId);
	if (!userId) return res.status(400).json({ error: "Invalid userId" });

	try {
		const friends = await filterJSON({
			url: `https://friends.roblox.com/v1/users/${userId}/friends`,
			exhaust: false,
			filter: getIdentificationInfo
		});

		res.json(friends);
	} catch (err) {
		console.error("Friends error:", err);
		res.status(500).json({ error: "Failed to fetch friends" });
	}
});

export default router;

