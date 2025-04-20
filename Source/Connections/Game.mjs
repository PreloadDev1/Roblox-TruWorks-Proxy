import express from "express";
import Profile from "../Services/ProfileService.mjs";

const Router = express.Router();

function ParseDateParts(DateString) {
	const DateObj = new Date(DateString);
	return {
		Year: DateObj.getUTCFullYear(),
		Month: DateObj.getUTCMonth() + 1,
		Day: DateObj.getUTCDate(),
		Hour: DateObj.getUTCHours(),
		Minute: DateObj.getUTCMinutes(),
		Second: DateObj.getUTCSeconds(),
		Millisecond: DateObj.getUTCMilliseconds()
	};
}

Router.get("/:PlaceID", async (req, res) => {
	try {
		const PlaceID = parseInt(req.params.PlaceID);
		if (isNaN(PlaceID)) {
			return res.status(400).json({ error: "Invalid Place ID" });
		}

		const UniverseRes = await fetch(`https://apis.roblox.com/universes/v1/places/${PlaceID}/universe`);
		if (!UniverseRes.ok) {
			throw new Error("Invalid Place ID");
		}

		const { universeId } = await UniverseRes.json();

		const GameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
		if (!GameRes.ok) {
			throw new Error("Failed to get game data");
		}

		const GameData = await GameRes.json();
		const Game = GameData?.data?.[0];
		if (!Game) {
			return res.status(404).json({ error: "Game not found" });
		}

		let Creator = {
			ID: Game.creator.id,
			Username: Game.creator.name,
			DisplayName: null,
			IsVerified: false,
			Created: null,
			Description: null,
			IsBanned: false
		};

		if (Game.creator?.type === "User" && Game.creator?.id) {
			try {
				Creator = await Profile.GetBasicInfo(Game.creator.id);
			} catch {}
		}

		const Final = {
			AllowedGearCategories: Game.allowedGearCategories || [],
			AllowedGearGenres: Game.allowedGearGenres || [],
			CopyingAllowed: Game.copyingAllowed,
			CreateVipServersAllowed: Game.createVipServersAllowed,
			Created: ParseDateParts(Game.created),
			Updated: ParseDateParts(Game.updated),
			Creator,
			Favourites: Game.favoritedCount || 0,
			Genre1: Game.genre,
			Genre2: Game.genre_L1 || "",
			Genre3: Game.genre_L2 || "",
			UniverseID: Game.id,
			PlaceID: Game.rootPlaceId,
			IsAllGenre: Game.isAllGenre,
			IsGenreEnforced: Game.isGenreEnforced,
			ServerSize: Game.maxPlayers,
			Name: Game.name,
			ActivePlayers: Game.playing,
			Description: Game.sourceDescription || "",
			SourcedName: Game.sourceName || "",
			StudioAccessToAPI: Game.studioAccessToApisAllowed,
			AvatarType: Game.universeAvatarType,
			Visits: Game.visits,
			UpVotes: Game.upVotes,
			DownVotes: Game.downVotes
		};

		res.json(Final);

	} catch (err) {
		console.error("[/game/:PlaceID]", err);
		res.status(500).json({ error: "Failed to fetch game info" });
	}
});

export default Router;
