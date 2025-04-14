import filterJSON from "./filterjson.mjs";
import { getThumbnail } from "./thumbnails.mjs";

const Games = {};

const CreatorTypes = {
	User: "Users",
	Group: "Groups",
};

Games.get = async function(creatorId, creatorType) {
	const uri = creatorType === CreatorTypes.User ? "users" : "groups";

	const games = await filterJSON({
		url: `https://games.roblox.com/v2/${uri}/${creatorId}/games?accessFilter=2&limit=50`,
		exhaust: true,
		filter: (game) => ({
			ID: game.id,
			Name: game.name,
			Thumbnail: null,
			PlaceID: game.rootPlace?.id,
			Created: game.created,
			Updated: game.updated,
			Active: game.playing,
			Visits: game.visits,
			MaxPlayers: game.maxPlayers,
			CreatorType: creatorType,
			CreatorID: creatorId,
			UniverseID: game.id,
		})
	});

	const thumbs = await Games.getThumbnails(games.map(g => g.UniverseID));
	for (const game of games) {
		const found = thumbs.find(t => t.UniverseID === game.UniverseID);
		game.Thumbnail = found?.Thumbnail || null;
	}

	return games;
};

Games.getThumbnails = async function(universeIds = []) {
	if (!universeIds.length) return [];
	const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds.join(",")}&size=150x150&format=Png&isCircular=false`);
	const data = await res.json();
	return data.data.map(item => ({
		UniverseID: item.targetId,
		Thumbnail: item.imageUrl,
	}));
};

Games.getPasses = async function(universeId, creatorType, creatorId) {
	if (!universeId || !creatorType || !creatorId) return [];
	return await filterJSON({
		url: `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=10`,
		exhaust: true,
		filter: (pass) => ({
			ID: pass.id,
			Name: pass.name,
			Price: pass.price,
			CreatorType: creatorType,
			CreatorID: creatorId,
			Thumbnail: pass.thumbnail?.imageUrl || null,
		}),
	});
};

export default Games;
export { CreatorTypes };
