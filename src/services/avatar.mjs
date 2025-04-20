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
      console.warn("[AvatarAssets] Failed:", assetId);
      return null;
    }
  })
);
