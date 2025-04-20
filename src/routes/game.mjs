// src/routes/game.mjs
import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

function parseDateParts(dateString) {
	const date = new Date(dateString);
	return {
		Year: date.getUTCFullYear(),
		Month: date.getUTCMonth() + 1,
		Day: date.getUTCDate(),
		Hour: date.getUTCHours(),
		Minute: date.getUTCMinutes(),
		Second: date.getUTCSeconds(),
		Millisecond: date.getUTCMilliseconds()
	};
}

router.get("/:placeId", async (req, res) => {
	try {
		const placeId = parseInt(req.params.placeId);

		const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
		if (!universeRes.ok) throw new Error("Invalid Place ID");

		const { universeId } = await universeRes.json();
		const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
		if (!gameRes.ok) throw new Error("Failed to get game data");

		const gameData = await gameRes.json();
		const game = gameData?.data?.[0];
		if (!game) return res.status(404).json({ error: "Game not found" });

		let creatorInfo = {
			ID: game.creator.id,
			Username: game.creator.name,
			DisplayName: null,
			IsVerified: false,
			Created: null,
			Description: null,
			IsBanned: false
		};

		if (game.creator?.type === "User" && game.creator?.id) {
			try {
				creatorInfo = await Profile.getBasicInfo(game.creator.id);
			} catch {}
		}

		const finalGameData = {
			AllowedGearCategories: game.allowedGearCategories || [],
			AllowedGearGenres: game.allowedGearGenres || [],
			CopyingAllowed: game.copyingAllowed,
			CreateVipServersAllowed: game.createVipServersAllowed,
			Created: parseDateParts(game.created),
			Updated: parseDateParts(game.updated),
			Creator: creatorInfo,
			Favourites: game.favoritedCount || 0,
			Genre1: game.genre,
			Genre2: game.genre_L1 || "",
			Genre3: game.genre_L2 || "",
			UniverseID: game.id,
			PlaceID: game.rootPlaceId,
			IsAllGenre: game.isAllGenre,
			IsGenreEnforced: game.isGenreEnforced,
			ServerSize: game.maxPlayers,
			Name: game.name,
			ActivePlayers: game.playing,
			Description: game.sourceDescription || "",
			SourcedName: game.sourceName || "",
			StudioAccessToAPI: game.studioAccessToApisAllowed,
			AvatarType: game.universeAvatarType,
			Visits: game.visits,
			UpVotes: game.upVotes,
			DownVotes: game.downVotes
		};

		res.json(finalGameData);
	} catch (err) {
		console.error("[/game/:placeId]", err);
		res.status(500).json({ error: "Failed to fetch game info" });
	}
});

export default router;
