import Express from "express";

const Router = Express.Router();

export async function GetThumbnail(UniverseID) {
	const Response = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${UniverseID}&size=150x150&format=Png&isCircular=false`);

	if (!Response.ok) return null;

	const Data = await Response.json();
	const Found = Data?.data?.find((Item) => Item.targetId === Number(UniverseID));

	return Found?.imageUrl || null;
}

Router.get("/game/:UniverseID", async (Request, Response) => {
	try {
		const Thumbnail = await GetThumbnail(Request.params.UniverseID);

		if (Thumbnail) {
			Response.json({ Thumbnail });
		} else {
			Response.status(404).json({ Error: "Thumbnail not found" });
		}
	} catch (Error) {
		console.error("[/game/:UniverseID]", Error);
		Response.status(500).json({ Error: "Failed to fetch thumbnail" });
	}
});

export default Router;
