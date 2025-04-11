const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/proxy", async (req, res) => {
	const target = req.query.url;
	if (!target || !target.startsWith("https://")) {
		return res.status(400).json({ error: "Invalid or missing 'url' query param." });
	}

	try {
		const response = await axios.get(target);
		res.json(response.data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log("Proxy server running on port", PORT);
});