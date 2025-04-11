
import filterJSON, { getMarketInfo, getIndentificationInfo } from "./filterjson.mjs"

const Games = {}

const CreatorTypes = {
    User: "User",
    Group: "Group",
}

Games.get = async function(creatorId, creatorType) {
    const creatorTypeUris = {
        [CreatorTypes.User]: "users",
        [CreatorTypes.Group]: "groups",
    }

    const creatorTypeUri = creatorTypeUris[creatorType]
    if (!creatorTypeUri) {
        throw new Error("Unknown creator type.")
    }

    const games = await filterJSON({
        url: `https://games.roblox.com/v2/${creatorTypeUri}/${creatorId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
        exhaust: true,
        filter: function(game) {
            return {
                id: game.id,
                name: game.name,
                placeId: game.rootPlaceId,
                creator: game.creator,
                visits: game.placeVisits,
                playing: game.playing,
                isActive: game.isActive,
            }
        },
    })

    // Append thumbnails and details
    for (const game of games) {
        try {
            // Thumbnails
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${game.placeId}&size=128x128&format=Png&isCircular=false`)
            const thumbs = await thumbRes.json()
            game.thumbnail = thumbs.data?.[0]?.imageUrl || null

            // Game metadata
    followersCount: followers.count,
    followingCount: following.count,
    avatar: avatar.data?.[0]?.imageUrl || null,
  };
};

Profile.getExtendedData = async function (userId) {
  const groups = await Groups.get(userId);
  const games = await Games.get(userId, CreatorTypes.User);

  // Group-owned games
  for (const group of groups) {
    const groupGames = await Games.get(group.id, CreatorTypes.Group);
    games.push(...groupGames);
  }

  let allGamePasses = [];
  for (const game of games) {
    const passes = await Games.getPasses(game.id);
    game.passes = passes;
    allGamePasses.push(...passes);
  }

  return {
    groups,
    games,
    allOwnedGamepasses: allGamePasses,
  };
};

export default Profile;
