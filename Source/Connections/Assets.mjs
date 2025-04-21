import Express from "express"
import PublicAssetsService from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
    const UserID = parseInt(Request.params.UserID)

    if (isNaN(UserID)) {
        return Response
            .status(400)
            .json({ Error: "Invalid User ID" })
    }

    try {
        const Assets = await PublicAssetsService.GetAll(UserID)
        Response.json(Assets)
    } catch {
        Response
            .status(500)
            .json({ Error: "Failed to fetch public assets" })
    }
})

export default Router
