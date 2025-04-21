import Express from "express"
import ProfileService from "../Services/ProfileService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
    const UserID = parseInt(Request.params.UserID)

    if (isNaN(UserID)) {
        return Response
            .status(400)
            .json({ Error: "Invalid User ID" })
    }

    try {
        const Products = await ProfileService.GetDevProducts(UserID)
        Response.json(Products)
    } catch {
        Response
            .status(500)
            .json({ Error: "Failed to fetch developer products" })
    }
})

export default Router
