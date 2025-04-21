import FilterJSON from "../Utilities/FilterJson.mjs"
import { GetThumbnail } from "./ThumbnailService.mjs"
import ProfileService from "./ProfileService.mjs"

export const CreatorTypes = {
  User: "Users",
  Group: "Groups"
}

function ParseDate(dateString) {
  const d = new Date(dateString)
  return {
    Year: d.getUTCFullYear(),
    Month: d.getUTCMonth() + 1,
    Day: d.getUTCDate(),
    Hour: d.getUTCHours(),
    Minute: d.getUTCMinutes(),
    Second: d.getUTCSeconds(),
    Millisecond: d.getUTCMilliseconds()
  }
}

class Games {
  static async Get(CreatorID, CreatorType) {
    const uri = CreatorType === CreatorTypes.User ? "users" : "groups"
    const entries = await FilterJSON({
      URL: `https://games.roblox.com/v2/${uri}/${CreatorID}/games?accessFilter=2&limit=50&sortOrder=Asc`,
      Exhaust: true,
      Filter: (g) => ({
        UniverseID: g.id,
        PlaceID: g.rootPlace?.id
      })
    })

    const result = []

    for (const { UniverseID, PlaceID } of entries) {
      if (!PlaceID) continue
      try {
        const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${PlaceID}/universe`)
        if (!uniRes.ok) continue

        const { universeId } = await uniRes.json()
        const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
        if (!gameRes.ok) continue

        const { data } = await gameRes.json()
        const game = data?.[0]
        if (!game) continue

        let creator = {
          ID: game.creator.id,
          Username: game.creator.name,
          DisplayName: null,
          IsVerified: false,
          Created: null,
          Description: null,
          IsBanned: false
        }

        if (game.creator.type === "User") {
          try {
            creator = await ProfileService.GetBasicInfo(game.creator.id)
          } catch {}
        }

        const passes = await Games.GetPasses(PlaceID, CreatorType, CreatorID)

        result.push({
          AllowedGearCategories: game.allowedGearCategories || [],
          AllowedGearGenres: game.allowedGearGenres || [],
          CopyingAllowed: game.copyingAllowed,
          CreateVipServersAllowed: game.createVipServersAllowed,
          Created: ParseDate(game.created),
          Updated: ParseDate(game.updated),
          Creator: creator,
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
          Thumbnail: await GetThumbnail(game.id),
          Passes: passes
        })
      } catch {}
    }

    return result
  }

  static async GetGameData(PlaceID) {
    try {
      const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${PlaceID}/universe`)
      if (!uniRes.ok) return null

      const { universeId } = await uniRes.json()
      const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
      if (!gameRes.ok) return null

      const { data } = await gameRes.json()
      const game = data?.[0]
      if (!game) return null

      const passes = await Games.GetPasses(PlaceID, CreatorTypes.User, game.creator?.id || 0)

      return {
        AllowedGearCategories: game.allowedGearCategories || [],
        AllowedGearGenres: game.allowedGearGenres || [],
        CopyingAllowed: game.copyingAllowed,
        CreateVipServersAllowed: game.createVipServersAllowed,
        Created: ParseDate(game.created),
        Updated: ParseDate(game.updated),
        Creator: {
          ID: game.creator.id,
          Username: game.creator.name,
          DisplayName: null,
          IsVerified: false,
          Created: null,
          Description: null,
          IsBanned: false
        },
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
        Passes: passes
      }
    } catch {
      return null
    }
  }

  static async GetPasses(PlaceID, CreatorType, CreatorID) {
    return await FilterJSON({
      URL: `https://games.roblox.com/v1/games/${PlaceID}/game-passes?limit=100&sortOrder=Asc`,
      Exhaust: true,
      Filter: (p) => ({
        ID: p.id,
        Name: p.name,
        Price: p.price,
        Thumbnail: p.thumbnail?.imageUrl || null,
        CreatorType,
        CreatorID
      })
    })
  }

  static async GetDevProducts(UniverseID, CreatorType, CreatorID) {
    return await FilterJSON({
      URL: `https://games.roblox.com/v1/games/${UniverseID}/developer-products?limit=50`,
      Exhaust: true,
      Filter: (d) => ({
        ID: d.id,
        Name: d.name,
        Price: d.priceInRobux,
        CreatorType,
        CreatorID,
        Thumbnail: d.thumbnail?.imageUrl || null
      })
    })
  }
}

export default Games
