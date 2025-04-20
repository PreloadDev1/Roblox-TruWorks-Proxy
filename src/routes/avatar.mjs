// src/avatar.mjs

export default async function getAvatarAssets(userId) {
	const res = await fetch(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`);
	const data = await res.json();

	if (!Array.isArray(data.assetIds)) return [];

	const detailedAssets = await Promise.all(
		data.assetIds.map(async (assetId) => {
			try {
				const response = await fetch(`https://catalog.roblox.com/v1/catalog/items/${assetId}/details`);
				const assetData = await response.json();

				return {
					ID: assetId,
					Name: assetData.name || null,
					Type: assetData.assetType || null,
					Thumbnail: assetData.thumbnailUrl || null,
				};
			} catch (err) {
				console.warn("[AvatarAssets] Failed to fetch asset detail for ID:", assetId, err);
				return null;
			}
		})
	);

	// Filter out any failed/null results
	return detailedAssets.filter(asset => asset !== null);
}
