import express from "express"
import cors from "cors"
import Profile from "./Profile.mjs"
import Followers from "./Followers.mjs"
import Friends from "./Friends.mjs"
import Assets from "./Assets.mjs"
import Games from "./Games.mjs"
import Groups from "./Groups.mjs"
import Badges from "./Badges.mjs"

const App = express()
App.use(cors())

App.get("/profile/:id", async (Req, Res) => {
    const Data = await Profile.GetProfileData(Req.params.id)
    Res.json(Data)
})

App.get("/followers/:id", async (Req, Res) => {
    const Data = await Followers.GetFollowers(Req.params.id)
    Res.json(Data)
})

App.get("/friends/:id", async (Req, Res) => {
    const Data = await Friends.GetFriendInfo(Req.params.id)
    Res.json(Data)
})

App.get("/assets/:id", async (Req, Res) => {
    const Data = await Assets.GetPublicAssets(Req.params.id)
    Res.json(Data)
})

App.get("/games/:id", async (Req, Res) => {
    const Data = await Games.GetDetailedList(Req.params.id, "User")
    Res.json(Data)
})

App.get("/groups/:id", async (Req, Res) => {
    const Data = await Groups.GetDetailedList(Req.params.id)
    Res.json(Data)
})

App.get("/badges/:id", async (Req, Res) => {
    const Data = await Badges.GetBadgeInfo(Req.params.id)
    Res.json(Data)
})

App.get("/avatar/:id", async (Req, Res) => {
    const Data = await Avatar.GetAvatarData(Req.params.id)
    Res.json(Data)
})

App.get("/group/:id", async (Req, Res) => {
    const Data = await Groups.GetGroupData(Req.params.id)
    Res.json(Data)
})

App.get("/game/:id", async (Req, Res) => {
    const Data = await Games.GetGameData(Req.params.id)
    Res.json(Data)
})

App.get("/devproducts/:id", async (Req, Res) => {
    const Data = await DevProducts.GetDevProducts(Req.params.id)
    Res.json(Data)
})

App.get("/profile/:id/socials", async (Req, Res) => {
    const Data = await Profile.GetSocialLinks(Req.params.id)
    Res.json(Data)
})

App.listen(3000, () => {
    console.log("TruProxy server running on port 3000")
})
