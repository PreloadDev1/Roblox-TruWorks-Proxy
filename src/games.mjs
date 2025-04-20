import filterJSON from "./filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";

const Games = {};

const CreatorTypes = {
	User: "Users",
	Group: "Groups",
};

function formatDate(dateString) {
	const date = new Date(dateString);
	return {
		Year: date.getUTCFullYear(),
		Month: date.getUTCMonth() + 1,
		Day: date.getUTCDate(),
		Hour: date.getUTCHours(),
		Minute: date.getUTCMinutes(),
		Second: date.getUTCSeconds(),
	};
}

Games.get = async function (creatorId, creatorType) {
	const creatorTypeUris = {
		[CreatorTypes.User]: "users",
		[CreatorTypes.Group]: "groups",
	};

	const creatorTypeUri = creatorTypeUris[creatorType];
	if (!creatorTypeUri) throw new Error("Unknown creator type");

	const games = await filterJSON({
		url: `https://games.roblox.com/v2/${creatorTypeUri}/${creatorId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
		exhaust: true,
		filter: (game) => ({
			ID: game.id,
			Name: game.name,
			Thumbnail: null,
			PlaceID: game.rootPlace?.id,
			Created: formatDate(game.created),
			Updated: formatDate(game.updated),
			Active: game.playing,
			Visits: game.visits,
			MaxPlayers: game.maxPlayers,
			CreatorType: creatorType,
			CreatorID: creatorId,
			UniverseID: game.id,
		}),
	});

	const thumbnails = await Games.getThumbnails(games.map(g => g.UniverseID));
	for (const game of games) {
		const thumb = thumbnails.find(t => t.UniverseID === game.UniverseID);
		game.Thumbnail = thumb?.Thumbnail || null;
	}

	return games;
};

Games.getThumbnails = async function (universeIds = []) {
	if (universeIds.length === 0) return [];
	const idsParam = universeIds.join(",");
	const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsParam}&size=150x150&format=Png&isCircular=false`);
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

export default Games;
export { CreatorTypes };
