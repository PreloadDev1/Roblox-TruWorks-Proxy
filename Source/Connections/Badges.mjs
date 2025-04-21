import Express from "express"
import Profile from "../Services/ProfileService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" })

		const Result = await Profile.GetBadges(UserID)
		Response.json({
			Count: Result.Count,
			List: Result.List
		})
	} catch (Error) {
		console.error("[/badges/:UserID]", Error)
		Response.status(500).json({ Error: "Failed to fetch badges" })
	}
})

export default Router
