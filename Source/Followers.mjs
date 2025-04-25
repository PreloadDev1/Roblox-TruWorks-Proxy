import filterJSON from "./FilterJson.mjs"

const Followers = {}

function parseDate(DateString) {
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

async function getFullProfile(UserID) {
    const Response = await fetch(`https://users.roblox.com/v1/users/${UserID}`)
    if (!Response.ok) return null

    const Data = await Response.json()

    return {
        UserID: Data.id,
        Username: Data.name,
        DisplayName: Data.displayName,
        IsBanned: false,
        IsVerified: Data.hasVerifiedBadge || false,
        Description: Data.description || "",
        Created: parseDate(Data.created),
    }
}

Followers.GetFollowerInfo = async function(UserID) {
    const RawFollowers = await filterJSON({
        url: `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`,
        exhaust: true,
        filter: user => user,
    })

    const FollowersList = []

    for (const RawUser of RawFollowers) {
        const Full = await getFullProfile(RawUser.id)
        if (Full) FollowersList.push(Full)
    }

    return {
        FollowerCount: FollowersList.length,
        Followers: FollowersList,
    }
}

export default Followers
