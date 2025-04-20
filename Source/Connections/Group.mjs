import express from "express";
import Groups from "../Services/GroupService.mjs";

const Router = express.Router();

Router.get("/:GroupID", async (req, res) => {
	try {
		const GroupID = parseInt(req.params.GroupID);
		if (isNaN(GroupID)) {
			return res.status(400).json({ error: "Invalid Group ID" });
		}

		const Group = await Groups.GetSingle(GroupID);
		if (!Group) {
			return res.status(404).json({ error: "Group not found" });
		}

		res.json(Group);

	} catch (err) {
		console.error("[/group/:GroupID]", err);
		res.status(500).json({ error: "Failed to fetch group data" });
	}
});

export default Router;
