export async function getThumbnail(assetId, type = "Asset") {
    const response = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&format=Png&isCircular=false&size=150x150`)
    const data = await response.json()
    return data?.data?.[0]?.imageUrl || null
}
