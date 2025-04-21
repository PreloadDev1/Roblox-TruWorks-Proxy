import Express from "express"
import AvatarRouter from "./Avatar.mjs"
import BadgesRouter from "./Badges.mjs"
import DevProductsRouter from "./DevProducts.mjs"
import FollowersRouter from "./Followers.mjs"
import FriendsRouter from "./Friends.mjs"
import GameRouter from "./Game.mjs"
import GroupRouter from "./Group.mjs"
import ProfileRouter from "./Profile.mjs"
import SocialsRouter from "./Socials.mjs"
import AssetsRouter from "./Assets.mjs"

const Router = Express.Router()

Router.use("/avatar", AvatarRouter)

Router.use("/games", GameRouter)

Router.use("/groups", GroupRouter)

Router.use("/profile/:UserID/socials", SocialsRouter)

Router.use("/profile", ProfileRouter)

Router.use("/assets", AssetsRouter)

Router.use("/badges", BadgesRouter)

Router.use("/devproducts", DevProductsRouter)

Router.use("/followers", FollowersRouter)

Router.use("/friends", FriendsRouter)

export default Router
