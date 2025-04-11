// app.mjs
import express from "express"
import getPublicAssets from "./main.mjs" // ✅ make sure this is the updated main.mjs

const app = express()

app.get("/assets/:userId", async (req, res) => {
	try {
		const result = await getPublicAssets(req.params.userId)
		res.json(result)
	} catch (e) {
		console.error(e)
		res.status(500).json({ error: "Failed to get assets" })
	}
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("Server running on", PORT))
