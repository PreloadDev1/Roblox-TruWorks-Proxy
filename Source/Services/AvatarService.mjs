import { ToPascalCaseObject } from "../Utilities/FilterJson.mjs";

export default async function GetAvatarAssets(UserID) {
	const Response = await fetch(`https://avatar.roblox.com/v1/users/${UserID}/avatar-appearance`);
	if (!Response.ok) throw new Error("Failed to fetch avatar");

	const Data = await Response.json();

	const DetailedAssets = await Promise.all(
		Data.assetIds.map(async (AssetID) => {
			try {
				const Res = await fetch(`https://catalog.roblox.com/v1/catalog/items/${AssetID}/details`);
				const AssetData = await Res.json();

				return {
					ID: AssetID,
					Name: AssetData.name || null,
					Type: AssetData.assetType || null,
					Thumbnail: AssetData.thumbnailUrl || null
				};

			} catch {
				return null;
			}
		})
	);

	return DetailedAssets.filter(Boolean);
}
