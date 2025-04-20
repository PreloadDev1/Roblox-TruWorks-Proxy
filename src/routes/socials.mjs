import express from "express";
import Profile from "../services/profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const result = await Profile.getSocialLinks(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/socials/:userId]", err);
		res.status(500).json({ error: "Failed to fetch social links" });
	}
});

export default router;
