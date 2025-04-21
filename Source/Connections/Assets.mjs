import express from "express";
import PublicAssets from "../Services/PublicAssetsService.mjs";

const Router = express.Router();

Router.get("/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID);
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" });

		const Data = await PublicAssets.GetAll(UserID);
		res.json(Data);

	} catch (err) {
		console.error("[/assets/:UserID]", err);
		res.status(500).json({ Error: "Failed to fetch assets" });
	}
});

export default Router;
