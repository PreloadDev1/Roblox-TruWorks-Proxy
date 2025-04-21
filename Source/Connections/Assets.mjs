import Express from "express"
import GetPublicAssets from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (req, res) => {
  const UserID = parseInt(req.params.UserID, 10)
  if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" })

  const Data = await GetPublicAssets(UserID)
  res.json(Data)
})

export default Router
