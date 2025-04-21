import Express from "express"
import GetAvatarAssets from "../Services/AvatarService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" })

		const Assets = await GetAvatarAssets(UserID)
		Response.json(Assets)
	} catch (Error) {
		console.error("[/avatar/:UserID]", Error)
		Response.status(500).json({ Error: "Failed to fetch avatar assets" })
	}
})

export default Router
