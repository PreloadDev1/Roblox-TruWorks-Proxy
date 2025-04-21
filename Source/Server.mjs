import Express from "express";
import CORS from "cors";

import AvatarRoutes from "./Connections/Avatar.mjs";
import ProfileRoutes from "./Connections/Profile.mjs";
import DevProductsRoutes from "./Connections/DevProducts.mjs";
import FollowersRoutes from "./Connections/Followers.mjs";
import FriendsRoutes from "./Connections/Friends.mjs";
import BadgesRoutes from "./Connections/Badges.mjs";
import SocialsRoutes from "./Connections/Socials.mjs";
import GroupRoutes from "./Connections/Group.mjs";
import GameRoutes from "./Connections/Game.mjs";
import AppRoutes from "./Connections/Router.mjs";

const App = Express();
const Port = process.env.PORT || 3000;

App.use(CORS());

App.use("/devproducts", DevProductsRoutes);
App.use("/followers", FollowersRoutes);
App.use("/friends", FriendsRoutes);
App.use("/badges", BadgesRoutes);
App.use("/profile/:UserID/socials", SocialsRoutes);
App.use("/group", GroupRoutes);
App.use("/game", GameRoutes);
App.use("/avatar", AvatarRoutes);
App.use("/profile", ProfileRoutes);
App.use("/", AppRoutes);

App.listen(Port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${Port}`);
});
