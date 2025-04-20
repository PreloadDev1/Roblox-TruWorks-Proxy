// src/routes/group.mjs
import express from "express";
import Groups from "../services/groups.mjs";

const router = express.Router();

router.get("/:groupId", async (req, res) => {
	try {
		const groupId = parseInt(req.params.groupId);
		if (isNaN(groupId)) return res.status(400).json({ error: "Invalid group ID" });

		const results = await Groups.get(groupId); // returns an array of groups owned by this ID
		const group = results?.[0]; // single group match

		if (!group) return res.status(404).json({ error: "Group not found" });

		res.json(group);
	} catch (err) {
		console.error("[/group/:groupId]", err);
		res.status(500).json({ error: "Failed to fetch group" });
	}
});

export default router;
