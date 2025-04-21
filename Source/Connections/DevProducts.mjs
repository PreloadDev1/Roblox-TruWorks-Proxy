import Express from "express"
import Profile from "../Services/ProfileService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
	try {
		const UserID = parseInt(Request.params.UserID)
		if (isNaN(UserID)) return Response.status(400).json({ Error: "Invalid User ID" })

		const Products = await Profile.GetDevProducts(UserID)
		Response.json(Products)
	} catch (Error) {
		console.error("[/devproducts/:UserID]", Error)
		Response.status(500).json({ Error: "Failed to fetch developer products" })
	}
})

export default Router
