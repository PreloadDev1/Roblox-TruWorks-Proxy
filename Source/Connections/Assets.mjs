import Express from "express"
import GetPublicAssets from "../Services/PublicAssetsService.mjs"

const Router = Express.Router()

Router.get("/:UserID", async (req, res) => {
  const id = parseInt(req.params.UserID, 10)
  if (isNaN(id)) return res.status(400).json({ Error: "Invalid User ID" })
  res.json(await GetPublicAssets(id))
})

export default Router
