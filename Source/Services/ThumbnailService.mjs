import express from "express";

const Router = express.Router();

async function GetThumbnail(UniverseID) {
	const Res = await fetch(
		`https://thumbnails.roblox.com/v1/games/icons?universeIds=${UniverseID}&size=150x150&format=Png&isCircular=false`
	);

	if (!Res.ok) return null;

	const Data = await Res.json();
	const Found = Data?.data?.find((T) => T.targetId === Number(UniverseID));

	return Found?.imageUrl || null;
}

Router.get("/game/:universeId", async (Req, Res) => {
	const Thumbnail = await GetThumbnail(Req.params.universeId);

	if (Thumbnail) {
		Res.json({ Thumbnail });
	} else {
		Res.status(404).json({ error: "Thumbnail not found" });
	}
});

export { GetThumbnail };
export default Router;
