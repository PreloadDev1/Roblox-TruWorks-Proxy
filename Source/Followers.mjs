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

Followers.GetFollowers = async function(UserID) {
    const RawFollowers = await FilterJSON({
        url: `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`,
        exhaust: true,
        filter: User => User,
    })

    const FollowersList = []

    for (const RawUser of RawFollowers) {
        const Response = await fetch(`https://users.roblox.com/v1/users/${RawUser.id}`)
        if (!Response.ok) continue

        const Data = await Response.json()

        FollowersList.push({
            UserID: Data.id,
            Username: Data.name,
            DisplayName: Data.displayName,
            IsBanned: false,
            IsVerified: Data.hasVerifiedBadge || false,
            Description: Data.description || "",
            Created: ParseDate(Data.created),
        })
    }

    return {
        FollowerCount: FollowersList.length,
        Followers: FollowersList,
    }
}

export default Followers
