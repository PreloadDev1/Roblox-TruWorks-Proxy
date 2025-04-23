import Express from "express"
import GetPublicAssets from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (Request, Response) => {
    const UserId = parseInt(Request.params.UserID, 10)
    if (isNaN(UserId)) return Response.status(400).json({ Error: "Invalid User ID" })
    const Data = await GetPublicAssets(UserId)
    Response.json(Data)
})

export default Router
