// src/routes/devproducts.mjs
import express from "express";
import Profile from "../services/profile.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const products = await Profile.getDevProducts(req.params.userId);
		res.json(products);
	} catch (err) {
		console.error("[/devproducts/:userId]", err);
		res.status(500).json({ error: "Failed to fetch dev products" });
	}
});

export default router;
