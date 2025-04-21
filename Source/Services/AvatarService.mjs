import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";

export default async function GetAvatarAssets(UserID) {
	const Response = await fetch(`https://avatar.roblox.com/v1/users/${UserID}/avatar-appearance`);
	const Body = await Response.text();

	if (!Response.ok) {
		console.error("[AvatarService] Failed fetch:", Response.status, Body);
		throw new Error("Failed to fetch avatar");
	}

	const Data = JSON.parse(Body);

	if (!Array.isArray(Data.assetIds)) return [];

	const DetailedAssets = await Promise.all(
		Data.assetIds.map(async (AssetID) => {
			try {
				const Res = await fetch(`https://catalog.roblox.com/v1/catalog/items/${AssetID}/details`);
				const AssetBody = await Res.text();
				const AssetData = JSON.parse(AssetBody);

				return ToPascalCaseObject({
					id: AssetID,
					name: AssetData.name || null,
					type: AssetData.assetType || null,
					thumbnail: AssetData.thumbnailUrl || null
				});

			} catch (Error) {
				console.warn("[AvatarService] Failed to fetch asset:", AssetID, Error);
				return null;
			}
		})
	);

	return DetailedAssets.filter(Boolean);
}
