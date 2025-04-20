// src/routes/game.mjs
import express from "express";
import Games from "./games.mjs";

const router = express.Router();

Games.getGame = async function (universeId) {
	const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
	if (!res.ok) return null;

	const data = await res.json();
	const game = data?.data?.[0];
	if (!game) return null;

	return {
		AllowedGearCategories: game.allowedGearCategories || {},
		AllowedGearGenres: game.allowedGearGenres || {},
		CopyingAllowed: game.copyingAllowed,
		CreateVipServersAllowed: game.createVipServersAllowed,
		Created: game.created, // Keep as string
		Creator: game.creator,
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
		Updated: game.updated,
		Visits: game.visits,
		UpVotes: game.upVotes || 0,
		DownVotes: game.downVotes || 0,
	};
};


export default router;
