import FilterJSON from "../Utilities/FilterJson.mjs"
import { GetThumbnail } from "./ThumbnailService.mjs"
import ProfileService from "./ProfileService.mjs"

export const CreatorTypes = {
  User:  "Users",
  Group: "Groups"
}

function ParseDate(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  return {
    Year:        d.getUTCFullYear(),
    Month:       d.getUTCMonth() + 1,
    Day:         d.getUTCDate(),
    Hour:        d.getUTCHours(),
    Minute:      d.getUTCMinutes(),
    Second:      d.getUTCSeconds(),
    Millisecond: d.getUTCMilliseconds()
  }
}

class Games {
  static async Get(creatorId, creatorType) {
    const uri  = creatorType === CreatorTypes.User ? "users" : "groups"
    const list = await FilterJSON({
      URL:     `https://games.roblox.com/v2/${uri}/${creatorId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
      Exhaust: true,
      Filter:  g => ({
        UniverseID: g.id,
        PlaceID:    g.rootPlace?.id
      })
    })

    const out = []

    for (const { UniverseID, PlaceID } of list) {
      if (!PlaceID) continue

      const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${PlaceID}/universe`)
      if (!uniRes.ok) continue

      const { universeId } = await uniRes.json()
      const gameRes        = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
      if (!gameRes.ok) continue

      const { data } = await gameRes.json()
      const g        = data?.[0]
      if (!g) continue

      let creator = {
        ID:          g.creator.id,
        Username:    g.creator.name,
        DisplayName: null,
        IsVerified:  false,
        Created:     null,
        Description: null,
        IsBanned:    false
      }

      if (g.creator.type === "User") {
        try {
          creator = await ProfileService.GetBasicInfo(g.creator.id)
        } catch {}
      }

      const passes = await Games.GetPasses(PlaceID, creatorType, creatorId)

      out.push({
        UniverseID:              g.id,
        PlaceID:                 g.rootPlaceId,
        Name:                    g.name,
        Description:             g.sourceDescription || "",
        SourcedName:             g.sourceName || "",
        Genre1:                  g.genre,
        Genre2:                  g.genre_L1 || "",
        Genre3:                  g.genre_L2 || "",
        AllowedGearCategories:   g.allowedGearCategories || [],
        AllowedGearGenres:       g.allowedGearGenres    || [],
        CopyingAllowed:          g.copyingAllowed,
        CreateVipServersAllowed: g.createVipServersAllowed,
        ServerSize:              g.maxPlayers,
        AvatarType:              g.universeAvatarType,
        Favourites:              g.favoritedCount        || 0,
        Visits:                  g.visits,
        UpVotes:                 g.upVotes,
        DownVotes:               g.downVotes,
        ActivePlayers:           g.playing,
        Creator:                 creator,
        Created:                 ParseDate(g.created),
        Updated:                 ParseDate(g.updated),
        Thumbnail:               await GetThumbnail(g.id),
        Passes:                  passes
      })
    }

    return out
  }

  static async GetPasses(placeId, creatorType, creatorId) {
    return await FilterJSON({
      URL:     `https://games.roblox.com/v1/games/${placeId}/game-passes?limit=100&sortOrder=Asc`,
      Exhaust: true,
      Filter:  p => ({
        ID:          p.id,
        Name:        p.name,
        Price:       p.price,
        Thumbnail:   p.thumbnail?.imageUrl || null,
        CreatorType: creatorType,
        CreatorID:   creatorId
      })
    })
  }

  static async GetDevProducts(universeId, creatorType, creatorId) {
    return await FilterJSON({
      URL:     `https://games.roblox.com/v1/games/${universeId}/developer-products?limit=50`,
      Exhaust: true,
      Filter:  d => ({
        ID:          d.id,
        Name:        d.name,
        Price:       d.priceInRobux,
        Thumbnail:   d.thumbnail?.imageUrl || null,
        CreatorType: creatorType,
        CreatorID:   creatorId
      })
    })
  }

  static async GetGameData(placeId) {
    const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    if (!uniRes.ok) return null

    const { universeId } = await uniRes.json()
    const gameRes        = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    if (!gameRes.ok) return null

    const { data } = await gameRes.json()
    const g        = data?.[0]
    if (!g) return null

    let creatorInfo = {
      ID:          g.creator.id,
      Username:    g.creator.name,
      DisplayName: null,
      IsVerified:  false,
      Created:     null,
      Description: null,
      IsBanned:    false
    }

    if (g.creator.type === "User") {
      try {
        creatorInfo = await ProfileService.GetBasicInfo(g.creator.id)
      } catch {}
    }

    const passes = await Games.GetPasses(placeId, CreatorTypes.User, g.creator?.id || 0)

    return {
      UniverseID:              g.id,
      PlaceID:                 g.rootPlaceId,
      Name:                    g.name,
      Description:             g.sourceDescription || "",
      SourcedName:             g.sourceName || "",
      Genre1:                  g.genre,
      Genre2:                  g.genre_L1 || "",
      Genre3:                  g.genre_L2 || "",
      AllowedGearCategories:   g.allowedGearCategories || [],
      AllowedGearGenres:       g.allowedGearGenres    || [],
      CopyingAllowed:          g.copyingAllowed,
      CreateVipServersAllowed: g.createVipServersAllowed,
      ServerSize:              g.maxPlayers,
      AvatarType:              g.universeAvatarType,
      Favourites:              g.favoritedCount        || 0,
      Visits:                  g.visits,
      UpVotes:                 g.upVotes,
      DownVotes:               g.downVotes,
      ActivePlayers:           g.playing,
      Creator:                 creatorInfo,
      Created:                 ParseDate(g.created),
      Updated:                 ParseDate(g.updated),
      Thumbnail:               await GetThumbnail(g.id),
      Passes:                  passes
    }
  }
}

export default Games
