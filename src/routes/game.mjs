// src/routes/game.mjs
import express from "express";
import Games from "./games.mjs";

const router = express.Router();

import Profile from "./profile.mjs"; // Add this at the top if not already

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

	// Get full profile of creator
	const creatorId = game.creator?.id;
	const creatorType = game.creator?.type; // "User" or "Group"
	let creatorData = null;

	if (creatorId && creatorType === "User") {
		try {
			creatorData = await Profile.getBasicInfo(creatorId);
		} catch {
			creatorData = { id: creatorId, name: game.creator?.name };
		}
	} else {
		creatorData = { id: creatorId, name: game.creator?.name, type: creatorType };
	}

	return {
		AllowedGearCategories: game.allowedGearCategories || {},
		AllowedGearGenres: game.allowedGearGenres || {},
		CopyingAllowed: game.copyingAllowed,
		CreateVipServersAllowed: game.createVipServersAllowed,
		Created: parseDateParts(game.created),
		Updated: parseDateParts(game.updated),
		Creator: {
			ID: creatorData.id,
			Username: creatorData.name || creatorData.username || null,
			DisplayName: creatorData.displayName || null,
			IsBanned: creatorData.isBanned || false,
			IsVerified: creatorData.hasVerifiedBadge || false,
			Description: creatorData.description || null,
			Created: creatorData.created || null
		},
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
};



export default router;
