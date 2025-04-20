// src/routes/game.mjs
import express from "express";
import Games from "./games.mjs";

const router = express.Router();

import Profile from "./profile.mjs";

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

Games.getGame = async function (universeId) {
	const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
	if (!res.ok) return null;

	const data = await res.json();
	const game = data?.data?.[0];
	if (!game) return null;

	let creatorData = {
		ID: game.creator?.id || null,
		Username: game.creator?.name || null,
		DisplayName: null,
		Description: null,
		IsBanned: false,
		IsVerified: false,
		Created: null
	};

	if (game.creator?.type === "User" && game.creator?.id) {
		try {
			creatorData = await Profile.getBasicInfo(game.creator.id);
		} catch {}
	}

	return {
		AllowedGearCategories: game.allowedGearCategories || {},
		AllowedGearGenres: game.allowedGearGenres || {},
		CopyingAllowed: game.copyingAllowed,
		CreateVipServersAllowed: game.createVipServersAllowed,
		Created: parseDateParts(game.created),
		Updated: parseDateParts(game.updated),
		Creator: creatorData,
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
		DownVotes: game.downVotes || 0
	};
};


export default router;
