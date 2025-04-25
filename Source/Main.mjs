import Profile from "./Profile.mjs"

async function Main(UserID) {
    const Result = await Profile.GetProfileData(UserID)
    console.log(Result)
}

await Main(/* UserID */)
