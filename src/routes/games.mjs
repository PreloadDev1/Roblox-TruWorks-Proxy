// src/routes/games.mjs
import filterJSON from "../utils/filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";
import Profile from "./profile.mjs";

const Games = {};

const CreatorTypes = {
	User: "Users",
	Group: "Groups",
};

// Utility to convert ISO date to parts
function parseDate(dateString) {
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

Games.get = async function (creatorId, creatorType) {
	const uri = creatorType === CreatorTypes.User ? "users" : "groups";

	const baseGames = await filterJSON({
		url: `https://games.roblox.com/v2/${uri}/${creatorId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
		exhaust: true,
		filter: (game) => ({
			UniverseID: game.id,
			PlaceID: game.rootPlace?.id
		})
	});

	const finalGames = [];

	for (const entry of baseGames) {
		const placeId = entry.PlaceID;

		try {
			const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
			if (!universeRes.ok) continue;

			const { universeId } = await universeRes.json();

			const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
			if (!gameRes.ok) continue;

			const gameData = await gameRes.json();
			const game = gameData?.data?.[0];
			if (!game) continue;

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

			finalGames.push({
				AllowedGearCategories: game.allowedGearCategories || [],
				AllowedGearGenres: game.allowedGearGenres || [],
				CopyingAllowed: game.copyingAllowed,
				CreateVipServersAllowed: game.createVipServersAllowed,
				Created: parseDate(game.created),
				Updated: parseDate(game.updated),
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
				DownVotes: game.downVotes,
				Thumbnail: await getThumbnail(game.id, "GameIcon")
			});
		} catch (err) {
			console.warn(`[Games.get] Failed to enrich game ${entry.UniverseID}:`, err);
		}
	}

	return finalGames;
};

Games.getPasses = async function (universeId, creatorType, creatorId) {
	return await filterJSON({
		url: `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`,
		exhaust: true,
		filter: async (pass) => ({
			ID: pass.id,
			Name: pass.name,
			Price: pass.price,
			Thumbnail: pass.thumbnail?.imageUrl || await getThumbnail(pass.id, "Asset"),
			CreatorType: creatorType,
			CreatorID: creatorId,
		}),
	});
};


Games.getDevProducts = async function (universeId, creatorType, creatorId) {
	return await filterJSON({
		url: `https://games.roblox.com/v1/games/${universeId}/developer-products?limit=50`,
		exhaust: true,
		filter: async (product) => ({
			ID: product.id,
			Name: product.name,
			Price: product.priceInRobux,
			CreatorType: creatorType,
			CreatorID: creatorId,
			Thumbnail: await getThumbnail(product.id, "Asset")
		}),
	});
};

export default Games;
export { CreatorTypes };
