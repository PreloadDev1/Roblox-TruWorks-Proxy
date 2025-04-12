// src/games.mjs

import filterJSON, { getMarketInfo, getIdentificationInfo } from "./filterjson.mjs";

const Games = {};

const CreatorTypes = {
    User: "User",
    Group: "Group",
};

// Get all games created by a user or group
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
            Thumbnail: null, // Will be filled separately by getThumbnails
            placeId: game.rootPlace?.id,
            created: game.created,
            updated: game.updated,
            playing: game.playing,
            visits: game.visits,
            maxPlayers: game.maxPlayers,
            CreatorType: creatorType,
            CreatorID: creatorId,
            universeId: game.id,
        }),
    });

    return games;
};

// Get thumbnails for multiple universeIds
Games.getThumbnails = async function (universeIds = []) {
    if (universeIds.length === 0) return [];
    const idsParam = universeIds.join(",");
    const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsParam}&size=150x150&format=Png&isCircular=false`);
    const data = await res.json();
    return data.data.map(item => ({
        universeId: item.targetId,
        Thumbnail: item.imageUrl,
    }));
};

// Get favorite count for a universe
Games.getFavorites = async function (universeId) {
    const res = await fetch(`https://games.roblox.com/v1/games/${universeId}/favorites/count`);
    const data = await res.json();
    return data.favoritesCount;
};

// Get gamepasses for a universe and structure them
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

export default Games;
export { CreatorTypes };
