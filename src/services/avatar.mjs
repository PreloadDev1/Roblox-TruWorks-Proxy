import express from "express";
import getAvatarAssets from "../avatar.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const assets = await getAvatarAssets(userId);
        res.json(assets);
    } catch (err) {
        console.error("[/avatar/:userId]", err);
        res.status(500).json({ error: "Failed to fetch avatar data" });
    }
});

export default router;
