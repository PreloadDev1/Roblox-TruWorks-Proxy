import Express from "express"
import GroupService from "../Services/GroupService.mjs"

const Router = Express.Router()

Router.get("/:GroupID", async (Request, Response) => {
  const GroupID = parseInt(Request.params.GroupID)
  if (isNaN(GroupID)) {
    return Response.status(400).json({ Error: "Invalid Group ID" })
  }

  try {
    const Group = await GroupService.GetSingle(GroupID)
    if (!Group) {
      return Response.status(404).json({ Error: "Group not found" })
    }

    Response.json(Group)
  } catch {
    Response.status(500).json({ Error: "Failed to fetch group data" })
  }
})

export default Router
