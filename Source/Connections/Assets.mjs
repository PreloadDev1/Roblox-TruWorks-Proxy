import Express from "express"
import PublicAssets from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) {
			return Response.status(400).json({ Error: "Invalid User ID" })
		}

		const Result = await PublicAssets.GetAll(UserID)
		Response.json(Result)
	} catch (Error) {
		console.error("[/assets/:UserID]", Error)
		Response.status(500).json({ Error: "Failed to fetch public assets" })
	}
})

export default Router
