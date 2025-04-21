import Express from "express"
import Profile from "../Services/ProfileService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" })

		const SocialLinks = await Profile.GetSocialLinks(UserID)
		Response.json(SocialLinks)

	} catch (Error) {
		console.error("[/socials/:UserID]", Error)
		Response.status(500).json({ Error: "Failed to fetch social links" })
	}
})

export default Router
