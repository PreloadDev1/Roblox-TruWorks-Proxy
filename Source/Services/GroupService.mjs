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

const Groups = {}

Groups.Get = async function (userId) {
  return await FilterJSON({
    URL: `https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false`,
    Exhaust: false,
    Filter: async (row) => {
      const group = row.group
      if (!group || !row.role || row.role.rank !== 255) return null

      const res = await fetch(`https://groups.roblox.com/v1/groups/${group.id}`)
      if (!res.ok) return null
      const info = await res.json()

      const games = await Games.Get(group.id, CreatorTypes.Group)

      const activePlayers = games.reduce((sum, g) => sum + (g.ActivePlayers || 0), 0)
      const favourites = games.reduce((sum, g) => sum + (g.Favourites || 0), 0)

      const passesArrays = await Promise.all(
        games.map((g) => Games.GetPasses(g.PlaceID, CreatorTypes.Group, group.id))
      )
      const passes = passesArrays.flat()

      const merch = await Users.GetStoreAssets(group.id, CreatorTypes.Group, group.id)

      return {
        OwnerID: userId,
        ID: group.id,
        Name: info.name,
        OwnerName: info.owner?.username || null,
        Created: ParseDate(info.created),
        Members: info.memberCount || 0,
        Games: games,
        ActivePlayers: activePlayers,
        Favourites: favourites,
        Passes: passes,
        Merch: merch || []
      }
    }
  })
}

Groups.GetSingle = async function (groupId, ownerId = null) {
  const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`)
  if (!res.ok) return null
  const info = await res.json()

  const games = await Games.Get(groupId, CreatorTypes.Group)

  const activePlayers = games.reduce((sum, g) => sum + (g.ActivePlayers || 0), 0)
  const favourites = games.reduce((sum, g) => sum + (g.Favourites || 0), 0)

  const passesArrays = await Promise.all(
    games.map((g) => Games.GetPasses(g.PlaceID, CreatorTypes.Group, groupId))
  )
  const passes = passesArrays.flat()

  const merch = await Users.GetStoreAssets(groupId, CreatorTypes.Group, groupId)

  return {
    OwnerID: ownerId,
    ID: groupId,
    Name: info.name,
    OwnerName: info.owner?.username || null,
    Created: ParseDate(info.created),
    Members: info.memberCount || 0,
    Games: games,
    ActivePlayers: activePlayers,
    Favourites: favourites,
    Passes: passes,
    Merch: merch || []
  }
}

Groups.GetStoreAssets = async function (groupId) {
  return await FilterJSON({
    URL: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${groupId}&CreatorType=2&Limit=30&SortType=3`,
    Exhaust: true,
    Filter: (item) => ({
      ID: item.id,
      Name: item.name,
      Price: item.price,
      CreatorType: CreatorTypes.Group,
      CreatorID: groupId,
      Thumbnail: item.thumbnail?.imageUrl || null
    })
  })
}

export default Groups
