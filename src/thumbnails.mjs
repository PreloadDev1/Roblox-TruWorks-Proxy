export async function getThumbnail(assetId, type = "Asset") {
    const res = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&format=Png&isCircular=false&size=150x150`);
    const data = await res.json();
    return data?.data?.[0]?.imageUrl || null;
}
