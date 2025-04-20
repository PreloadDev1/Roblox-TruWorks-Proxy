import filterJSON from "../utils/filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";

const Games = {};

const CreatorTypes = {
	User: "Users",
	Group: "Groups",
};

Games.get = async function (creatorId, creatorType) {
	const uri = creatorType === CreatorTypes.User ? "users" : "groups";

	const games = await filterJSON({
		url: `https://games.roblox.com/v2/${uri}/${creatorId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
		exhaust: true,
		filter: (game) => ({
			ID: game.id,
			Name: game.name,
			PlaceID: game.rootPlace?.id,
			Thumbnail: null,
			Created: parseDate(game.created),
			Updated: parseDate(game.updated),
			Active: game.playing,
			Visits: game.visits,
			MaxPlayers: game.maxPlayers,
			CreatorType: creatorType,
			CreatorID: creatorId,
			UniverseID: game.id,
		}),
	});

	const thumbs = await Games.getThumbnails(games.map(g => g.UniverseID));
	for (const game of games) {
		const thumb = thumbs.find(t => t.UniverseID === game.UniverseID);
		game.Thumbnail = thumb?.Thumbnail || null;
	}

	return games;
};

Games.getGame = async function (universeId) {
	const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
	const data = await res.json();
	return data.data?.[0] || null;
};

Games.getThumbnails = async function (universeIds = []) {
	if (universeIds.length === 0) return [];

	const ids = universeIds.join(",");
	const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=150x150&format=Png&isCircular=false`);
	const data = await res.json();
	return data.data.map(item => ({
		UniverseID: item.targetId,
		Thumbnail: item.imageUrl,
	}));
};

Games.getFavorites = async function (universeId) {
	const res = await fetch(`https://games.roblox.com/v1/games/${universeId}/favorites/count`);
	const data = await res.json();
	return data.favoritesCount;
};

Games.getPasses = async function (universeId, creatorType, creatorId) {
	return await filterJSON({
		url: `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=10&sortOrder=1`,
		exhaust: true,
		filter: (pass) => ({
			ID: pass.id,
			Name: pass.name,
			Price: pass.price,
			Thumbnail: pass.thumbnail?.imageUrl || null,
			CreatorType: creatorType,
			CreatorID: creatorId,
		}),
	});
};

Games.getDevProducts = async function (universeId, creatorType, creatorId) {
	return await filterJSON({
		url: `https://games.roblox.com/v1/games/${universeId}/developer-products?limit=50`,
		exhaust: true,
		filter: (product) => ({
			ID: product.id,
			Name: product.name,
			Price: product.priceInRobux,
			CreatorType: creatorType,
			CreatorID: creatorId,
		}),
	});
};

function parseDate(isoString) {
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

export default Games;
export { CreatorTypes };
