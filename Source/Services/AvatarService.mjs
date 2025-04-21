export default async function GetAvatarAssets(UserID) {
  const response = await fetch(`https://avatar.roblox.com/v1/users/${UserID}/avatar-appearance`)
  if (!response.ok) throw new Error('Failed to fetch avatar appearance')

  const data = await response.json()
  const assetIds = Array.isArray(data.assetIds) ? data.assetIds : []

  const assets = await Promise.all(
    assetIds.map(async (id) => {
      try {
        const res = await fetch(`https://catalog.roblox.com/v1/catalog/items/${id}/details`)
        if (!res.ok) return null
        const item = await res.json()
        return {
          ID: id,
          Name: item.name || null,
          Type: item.assetType || null,
          Thumbnail: item.thumbnailUrl || null
        }
      } catch {
        return null
      }
    })
  )

  return assets.filter(Boolean)
}
