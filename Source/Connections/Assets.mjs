import Express from "express"
import PublicAssetsService from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (req, res) => {
	try {
		const UserID = parseInt(req.params.UserID)
		if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" })

		const Assets = await PublicAssetsService.GetPublicAssets(UserID)
		res.json(Assets)

	} catch (err) {
		console.error("[/assets/:UserID]", err)
		res.status(500).json({ Error: "Failed to fetch public assets" })
	}
})

export default Router
