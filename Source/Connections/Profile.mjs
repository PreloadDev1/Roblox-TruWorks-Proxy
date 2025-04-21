import Express from "express"
import Profile from "../Services/ProfileService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" })

		const ProfileData = await Profile.GetPublicAssets(UserID)
		Response.json(ProfileData)

	} catch (Error) {
		console.error("[/profile/:UserID] Error fetching profile:", Error)
		Response.status(500).json({ Error: "Failed to fetch profile data" })
	}
})

export default Router
