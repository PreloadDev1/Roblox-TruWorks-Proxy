import express from "express"

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
	res.send("Hello from TruWorks Proxy!")
})

app.listen(PORT, () => {
	console.log("Proxy running on port", PORT)
})
