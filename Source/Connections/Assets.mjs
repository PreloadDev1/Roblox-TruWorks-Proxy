import Express from "express";
import GetPublicAssets from "../Services/PublicAssetsService.mjs";

const Router = Express.Router();

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID);
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" });

		const Assets = await GetPublicAssets(UserID);
		Response.json(Assets);

	} catch (Error) {
		console.error("[/assets/:UserID] Error:", Error);
		Response.status(500).json({ Error: "Failed to fetch assets" });
	}
});

export default Router;
