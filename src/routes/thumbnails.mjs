import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.json({ message: "Thumbnails route is active." });
});

export default router;
