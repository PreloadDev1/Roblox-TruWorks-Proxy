import Express from "express"
import GamesService from "../Services/GameService.mjs"

const Router = Express.Router()

Router.get("/:PlaceID", async (Request, Response) => {
    const PlaceID = parseInt(Request.params.PlaceID)
    if (isNaN(PlaceID)) {
        return Response
            .status(400)
            .json({ Error: "Invalid Place ID" })
    }

    try {
        const Game = await GamesService.GetGameData(PlaceID)
        if (!Game) {
            return Response
                .status(404)
                .json({ Error: "Game not found" })
        }

        Response.json(Game)
    } catch {
        Response
            .status(500)
            .json({ Error: "Failed to fetch game data" })
    }
})

export default Router
