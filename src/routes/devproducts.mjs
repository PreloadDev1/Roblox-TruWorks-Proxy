import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const result = await Profile.getDevProducts(req.params.userId);
		res.json(result);
	} catch (err) {
		console.error("[/devproducts/:userId]", err);
		res.status(500).json({ error: "Failed to fetch developer products" });
	}
});

export default router;
