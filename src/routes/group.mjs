// src/routes/group.mjs
import express from "express";
import Groups from "./groups.mjs";

const router = express.Router();

router.get("/:groupId", async (req, res) => {
	try {
		const groupId = parseInt(req.params.groupId);
		const groupData = await Groups.get(groupId);
		const group = groupData?.[0];

		if (!group) return res.status(404).json({ error: "Group not found" });
		res.json(group);
	} catch (err) {
		console.error("[/group/:groupId]", err);
		res.status(500).json({ error: "Failed to fetch group data" });
	}
});

export default router;
