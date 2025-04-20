import express from "express";
import Profile from "../Services/ProfileService.mjs";

const Router = express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const Products = await Profile.GetDevProducts(req.params.UserID);
		res.json(Products);
	} catch (err) {
		console.error("[/devproducts/:UserID]", err);
		res.status(500).json({ error: "Failed to fetch developer products" });
	}
});

export default Router;
