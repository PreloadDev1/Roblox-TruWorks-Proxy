// src/routes/game.mjs
import express from "express";
import Profile from "./profile.mjs";

const router = express.Router();

function parseDateParts(isoString) {
	const date = new Date(isoString);
	return {
		Year: date.getUTCFullYear(),
		Month: date.getUTCMonth() + 1,
		Day: date.getUTCDate(),
		Hour: date.getUTCHours(),
		Minute: date.getUTCMinutes(),
		Second: date.getUTCSeconds(),
		Millisecond: date.getUTCMilliseconds(),
	};
}

// 🎯 Route: /game/place/:placeId
router.get("/place/:placeId", async (req, res) => {
	try {
		const placeId = parseInt(req.params.placeId);
		if (isNaN(placeId)) return res.status(400).json({ error: "Invalid placeId" });

		// 🔍 Get UniverseID from PlaceID
		const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
		if (!universeRes.ok) throw new Error("Failed to get Universe ID from PlaceID");

		const { universeId } = await universeRes.json();
		if (!universeId) return res.status(404).json({ error: "No universe found for this PlaceID" });

		// 🔍 Get game data
		const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
		if (!gameRes.ok) throw new Error("Failed to get game info");

		const data = await gameRes.json();
		const game = data?.data?.[0];
		if (!game) return res.status(404).json({ error: "Game not found" });

		// 🧠 Get creator info
		let creator = {
			ID: game.creator?.id || null,
			Username: game.creator?.name || null,
			DisplayName: null,
			Description: null,
			IsBanned: false,
			IsVerified: false,
			Created: null,
		};

		if (game.creator?.type === "User" && game.creator?.id) {
			try {
				creator = await Profile.getBasicInfo(game.creator.id);
			} catch {}
		}

		const output = {
			AllowedGearCategories: game.allowedGearCategories || {},
			AllowedGearGenres: game.allowedGearGenres || {},
			CopyingAllowed: game.copyingAllowed,
			CreateVipServersAllowed: game.createVipServersAllowed,
			Created: parseDateParts(game.created),
			Updated: parseDateParts(game.updated),
			Creator: creator,
			Favourites: game.favoritedCount || 0,
			Genre1: game.genre || "",
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
			AvatarType: game.universeAvatarType || "PlayerChoice",
			Visits: game.visits,
			UpVotes: game.upVotes || 0,
			DownVotes: game.downVotes || 0,
		};

		res.json(output);
	} catch (err) {
		console.error("[/game/place/:placeId]", err);
		res.status(500).json({ error: "Failed to fetch game data" });
	}
});

export default router;
