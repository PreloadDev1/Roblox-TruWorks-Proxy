export async function GetThumbnail(UniverseID) {
  const response = await fetch(
    `https://thumbnails.roblox.com/v1/games/icons?universeIds=${UniverseID}&size=150x150&format=Png&isCircular=false`
  )
  if (!response.ok) return null

  const data = await response.json()
  const entry = data.data?.find((item) => item.targetId === Number(UniverseID))
  return entry?.imageUrl || null
}
