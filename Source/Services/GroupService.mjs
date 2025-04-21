import FilterJSON from "../Utilities/FilterJson.mjs"
import Games, { CreatorTypes } from "./GameService.mjs"
import Users from "./UserService.mjs"

function ParseDate(dateString) {
  if (!dateString) return null
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

class Groups {
  static async Get(userID) {
    const roles = await FilterJSON({
      URL: `https://groups.roblox.com/v1/users/${userID}/groups/roles?includeLocked=false`,
      Exhaust: false,
      Filter: async (row) => {
        const g = row.group
        if (!g || !row.role || row.role.rank !== 255) return null

        const res = await fetch(`https://groups.roblox.com/v1/groups/${g.id}`)
        if (!res.ok) return null

        const info = await res.json()
        const games = await Games.Get(g.id, CreatorTypes.Group)

        const passesLists = await Promise.all(
          games.map((gm) => Games.GetPasses(gm.PlaceID, CreatorTypes.Group, g.id))
        )

        const merch = await Users.GetStoreAssets(g.id, CreatorTypes.Group, g.id)

        return {
          OwnerID: userID,
          ID: g.id,
          Name: g.name,
          OwnerName: info.owner?.username || null,
          Created: ParseDate(info.created),
          Members: info.memberCount || 0,
          Games: games,
          ActivePlayers: games.reduce((a, x) => a + (x.ActivePlayers || 0), 0),
          Favourites: games.reduce((a, x) => a + (x.Favourites || 0), 0),
          Passes: passesLists.flat(),
          Merch: merch || []
        }
      }
    })

    return roles
  }

  static async GetSingle(groupID, ownerID = null) {
    const res = await fetch(`https://groups.roblox.com/v1/groups/${groupID}`)
    if (!res.ok) return null

    const info = await res.json()
    const games = await Games.Get(groupID, CreatorTypes.Group)

    const passesLists = await Promise.all(
      games.map((gm) => Games.GetPasses(gm.PlaceID, CreatorTypes.Group, groupID))
    )

    const merch = await Users.GetStoreAssets(groupID, CreatorTypes.Group, groupID)

    return {
      OwnerID: ownerID,
      ID: groupID,
      Name: info.name,
      OwnerName: info.owner?.username || null,
      Created: ParseDate(info.created),
      Members: info.memberCount || 0,
      Games: games,
      ActivePlayers: games.reduce((a, x) => a + (x.ActivePlayers || 0), 0),
      Favourites: games.reduce((a, x) => a + (x.Favourites || 0), 0),
      Passes: passesLists.flat(),
      Merch: merch || []
    }
  }

  static async GetStoreAssets(groupID) {
    return await FilterJSON({
      URL: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${groupID}&CreatorType=2&Limit=30&SortType=3`,
      Exhaust: true,
      Filter: async (item) => ({
        ID: item.id,
        Name: item.name,
        Price: item.price,
        CreatorID: groupID,
        CreatorType: "Groups",
        Thumbnail: item.thumbnail?.imageUrl || null
      })
    })
  }
}

Groups.Get = async function (userId) {
  return await FilterJSON({
    URL: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false`,
    Exhaust: false,
    Filter: async (row) => {
      const g = row.group
      if (!g || !row.role || row.role.rank !== 255) return null

      const infoRes = await fetch(`https://groups.roblox.com/v1/groups/${g.id}`)
      if (!infoRes.ok) return null
      const info = await infoRes.json()

      const games = await Games.Get(g.id, CreatorTypes.Group)
      const passes = (await Promise.all(
        games.map((game) =>
          Games.GetPasses(game.PlaceID, CreatorTypes.Group, g.id)
        )
      )).flat()

      const merch = await Users.GetStoreAssets(g.id, CreatorTypes.Group, g.id)

      return {
        OwnerID: userId,
        ID: g.id,
        Name: info.name,
        OwnerName: info.owner?.username ?? null,
        Created: ParseDate(info.created),
        Members: info.memberCount,
        Games: games,
        ActivePlayers: games.reduce((sum, x) => sum + (x.ActivePlayers||0), 0),
        Favourites: games.reduce((sum, x) => sum + (x.Favourites||0), 0),
        Passes: passes,
        Merch: merch || []
      }
    }
  })
}

export default Groups
