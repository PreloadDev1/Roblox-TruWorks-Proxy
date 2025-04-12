// src/games.mjs

import filterJSON, { getMarketInfo, getIndentificationInfo } from "./filterjson.mjs";

const Games = {};

const CreatorTypes = {
    User: "User",
    Group: "Group",
};

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
        filter: (game) => {
            return {
                id: game.id,
                name: game.name,
                placeId: game.rootPlace?.id,
                created: game.created,
                updated: game.updated,
                playing: game.playing,
                visits: game.visits,
                maxPlayers: game.maxPlayers,
                creator: game.creator?.name,
                universeId: game.id,
            };
        },
    });

    return games;
};

Games.getThumbnails = async function (universeIds = []) {
    const idsParam = universeIds.join(",");
    const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsParam}&size=150x150&format=Png&isCircular=false`);
    const data = await res.json();
    return data.data.map(item => ({ universeId: item.targetId, imageUrl: item.imageUrl }));
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
		filter: getMarketInfo(creatorType, creatorId),
	})
}

export default Games;
export { CreatorTypes };
