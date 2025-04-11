import express from "express"
import getPublicAssets from "./main.mjs" // ✅ Importing the actual logic

const app = express()
const PORT = process.env.PORT || 3000

// 🎯 Key route for fetching public assets
app.get("/assets/:userId", async (req, res) => {
	try {
		const userId = req.params.userId
		const result = await getPublicAssets(userId)
		res.json(result)
	} catch (err) {
		console.error("[/assets/:userId]", err)
		res.status(500).json({ error: "Failed to fetch assets" })
	}
})

app.listen(PORT, () => {
	console.log("Proxy running on port", PORT)
})
