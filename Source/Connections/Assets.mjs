import Express from "express"
import PublicAssetsService from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" })

		const Assets = await PublicAssetsService.GetPublicAssets(UserID)
		Response.json(Assets)
	} catch (err) {
		console.error("[/assets/:UserID]", err)
		Response.status(500).json({ Error: "Failed to fetch public assets" })
	}
})

export default Router
