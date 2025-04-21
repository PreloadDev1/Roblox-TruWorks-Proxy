import Express from "express"
import PublicAssetsService from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (req, res) => {
  const UserID = parseInt(req.params.UserID)
  if (isNaN(UserID)) return res.status(400).json({ Error: "Invalid User ID" })
  const Data = await PublicAssetsService.GetPublicAssets(UserID)
  res.json(Data)
})

export default Router
