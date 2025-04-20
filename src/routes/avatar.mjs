// src/routes/avatar.mjs
export default async function getAvatarAssets(userId) {
	const res = await fetch(`https://avatar.roblox.com/v1/users/${userId}/outfits`);
	if (!res.ok) return [];

	const data = await res.json();
	if (!Array.isArray(data.data)) return [];

	return data.data.map(outfit => ({
		ID: outfit.id,
		Name: outfit.name,
		AssetCount: outfit.assetIds?.length || 0,
		IsEditable: outfit.isEditable,
	}));
}
