// avatar.mjs

import filterJSON from "./filterjson.mjs"

const Avatar = {}

// Fetch currently equipped avatar items Avatar.getOutfit = async function (userId) { const res = await fetch(https://avatar.roblox.com/v1/users/${userId}/currently-wearing) if (!res.ok) throw new Error("Failed to fetch avatar outfit") const data = await res.json() return data.assetIds || [] }

// Fetch info about individual avatar assets (e.g. hats, shirts) Avatar.getItemDetails = async function (assetIds = []) { if (!Array.isArray(assetIds) || assetIds.length === 0) return [] const idsParam = assetIds.join(",") const res = await fetch(https://catalog.roblox.com/v1/catalog/items/details?assetIds=${idsParam}) const data = await res.json() if (!data || !Array.isArray(data.data)) return []

return data.data.map(item => ({
	ID: item.id,
	Name: item.name,
	Type: item.assetType,
	Price: item.price,
	CreatorName: item.creatorName,
	Thumbnail: item.thumbnail?.imageUrl || null
}))

}

// Get all avatar items equipped by a user with details Avatar.getDetailedOutfit = async function (userId) { const assetIds = await Avatar.getOutfit(userId) const details = await Avatar.getItemDetails(assetIds) return details }

export default Avatar

