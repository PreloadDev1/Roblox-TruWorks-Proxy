import express from "express";
import cors from "cors";
import Games, { CreatorTypes } from "./games.mjs";
import Profile from "./profile.mjs";
import Groups from "./groups.mjs";
import Users from "./users.mjs";
import Avatar from "./avatar.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function sendResult(res, data) {
	if (!data) return res.status(404).json({ success: false, message: "Not Found" });
	return res.json(data);
}

// Assets and User data
app.get("/assets/:userId", async (req, res) => {
	const data = await Profile.getPublicAssets(req.params.userId);
	sendResult(res, data);
});

app.get("/avatar/:userId", async (req, res) => {
	const data = await Avatar.getAssets(req.params.userId);
	sendResult(res, data);
});

// Games
app.get("/games/:userId", async (req, res) => {
	const data = await Games.get(req.params.userId, CreatorTypes.User);
	sendResult(res, data);
});

app.get("/game/:universeId", async (req, res) => {
	const data = await Games.getGame(req.params.universeId);
	sendResult(res, data);
});

app.get("/devproducts/:userId", async (req, res) => {
	const games = await Games.get(req.params.userId, CreatorTypes.User);
	const allProducts = [];

	for (const game of games) {
		const products = await Games.getDevProducts(game.UniverseID, CreatorTypes.User, req.params.userId);
		allProducts.push(...products);
	}

	sendResult(res, allProducts);
});

app.get("/badges/:userId", async (req, res) => {
	const data = await Profile.getBadges(req.params.userId);
	sendResult(res, data);
});

// Friends, Followers
app.get("/followers/:userId", async (req, res) => {
	const data = await Profile.getFollowers(req.params.userId);
	sendResult(res, data);
});

app.get("/friends/:userId", async (req, res) => {
	const data = await Profile.getFriends(req.params.userId);
	sendResult(res, data);
});

// Social Links
app.get("/profile/:userId/socials", async (req, res) => {
	const data = await Profile.getSocialLinks(req.params.userId);
	sendResult(res, data);
});

// Profile Info
app.get("/profile/:userId", async (req, res) => {
	const data = await Profile.getBasicInfo(req.params.userId);
	sendResult(res, data);
});

// Developer Data (fallback)
app.get("/developer/:userId", async (req, res) => {
	const result = {
		DevProducts: [],
		UserPasses: [],
		GroupPasses: [],
	};

	const games = await Games.get(req.params.userId, CreatorTypes.User);
	for (const game of games) {
		const dev = await Games.getDevProducts(game.UniverseID, CreatorTypes.User, req.params.userId);
		const passes = await Games.getPasses(game.UniverseID, CreatorTypes.User, req.params.userId);
		result.DevProducts.push(...dev);
		result.UserPasses.push(...passes);
	}

	const groups = await Groups.get(req.params.userId);
	for (const group of groups) {
		const groupGames = await Games.get(group.ID, CreatorTypes.Group);
		for (const game of groupGames) {
			const dev = await Games.getDevProducts(game.UniverseID, CreatorTypes.Group, group.ID);
			const passes = await Games.getPasses(game.UniverseID, CreatorTypes.Group, group.ID);
			result.DevProducts.push(...dev);
			result.GroupPasses.push(...passes);
		}
	}

	sendResult(res, result);
});

// Group Info
app.get("/group/:groupId", async (req, res) => {
	const data = await Groups.get(req.params.groupId);
	sendResult(res, data);
});

app.get("/groups/:userId", async (req, res) => {
	const data = await Groups.get(req.params.userId);
	sendResult(res, data);
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
