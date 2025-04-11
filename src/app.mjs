import express from "express"
import Games, { CreatorTypes } from "./games.mjs"
import Groups from "./groups.mjs"

const app = express()
const PORT = process.env.PORT || 3000

async function getPublicAssets(userId) {
	const games = await Games.get(userId, CreatorTypes.User)
	const groups = await Groups.get(userId)

	let result = {
		gamePasses: [],
		groupGamePasses: [],
		groupStoreAssets: [],
	}

	for (const game of games) {
		const gamePasses = await Games.getPasses(game.id)
		result.gamePasses.push(...gamePasses)
	}

	for (const group of groups) {
		const groupGames = await Games.get(group.id, CreatorTypes.Group)
		const storeAssets = await Groups.getStoreAssets(group.id)

		for (const game of groupGames) {
			const gamePasses = await Games.getPasses(game.id)
			result.groupGamePasses.push(...gamePasses)
		}

		result.groupStoreAssets.push(...storeAssets)
	}

	return result
}

// 🚨 THIS IS THE CRUCIAL ROUTE
app.get("/assets/:userId", async (req, res) => {
	const userId = req.params.userId
	const result = await getPublicAssets(userId)
	res.json(result)
})

app.listen(PORT, () => {
	console.log("Proxy running on port", PORT)
})
