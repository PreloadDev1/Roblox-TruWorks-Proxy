import express from "express";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	const userId = Number(req.params.userId);
	if (!userId) return res.status(400).json({ error: "Invalid userId" });

	try {
		const response = await fetch(`https://users.roblox.com/v1/users/${userId}/social-links`);
		const json = await response.json();
		res.json(json.data || []);
	} catch (err) {
		console.error("SocialLinks error:", err);
		res.status(500).json({ error: "Failed to fetch social links" });
	}
});

export default router;

