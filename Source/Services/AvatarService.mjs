const GetAvatarAssets = async function (UserID) {
	const Response = await fetch(`https://avatar.roblox.com/v1/users/${UserID}/avatar`);
	if (!Response.ok) throw new Error("Failed to fetch avatar data");

	const Data = await Response.json();

	const DetailedAssets = await Promise.all(
		Data.assetIds.map(async (AssetID) => {
			try {
				const Response = await fetch(`https://catalog.roblox.com/v1/catalog/items/${AssetID}/details`);
				if (!Response.ok) return null;

				const AssetData = await Response.json();

				return {
					ID: AssetID,
					Name: AssetData.name || null,
					Type: AssetData.assetType || null,
					Thumbnail: AssetData.thumbnailUrl || null
				};
			} catch {
				console.warn("[AvatarAssets] Failed:", AssetID);
				return null;
			}
		})
	);

	return {
		UserID,
		Assets: DetailedAssets.filter(Boolean)
	};
};

export default GetAvatarAssets;
