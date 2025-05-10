import FilterJSON from "./FilterJson.mjs"

const Followers = {}

function ParseDate(DateString) {
    const DateObject = new Date(DateString)
    return {
        Year: DateObject.getUTCFullYear(),
        Month: DateObject.getUTCMonth() + 1,
        Day: DateObject.getUTCDate(),
        Hour: DateObject.getUTCHours(),
        Minute: DateObject.getUTCMinutes(),
        Second: DateObject.getUTCSeconds(),
        Millisecond: DateObject.getUTCMilliseconds(),
    }
}

async function FetchAllFollowers(UserID) {
    let Cursor = ""
    const FollowersList = []

    while (true) {
        const Url = `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100${Cursor ? `&cursor=${Cursor}` : ""}`
        const Response = await fetch(Url)
        if (!Response.ok) break

        const Data = await Response.json()
        const Users = Data.data || []
        const NextCursor = Data.nextPageCursor

        for (const User of Users) {
            const UserResponse = await fetch(`https://users.roblox.com/v1/users/${User.id}`)
            if (!UserResponse.ok) continue

            const UserData = await UserResponse.json()

            FollowersList.push({
                UserID: UserData.id,
                Username: UserData.name,
                DisplayName: UserData.displayName,
                IsBanned: false,
                IsVerified: UserData.hasVerifiedBadge || false,
                Description: UserData.description || "",
                Created: ParseDate(UserData.created),
            })
        }

        if (!NextCursor) break
        Cursor = NextCursor
    }

    return FollowersList
}

Followers.GetFollowers = async function(UserID) {
    const FollowersList = await FetchAllFollowers(UserID)
    return {
        FollowerCount: FollowersList.length,
        Followers: FollowersList,
    }
}

export default Followers
