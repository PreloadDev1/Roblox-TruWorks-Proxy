import filterJSON from "./FilterJson.mjs"

const Friends = {}

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

Friends.GetFriendInfo = async function(UserID) {
    const RawFriends = await filterJSON({
        url: `https://friends.roblox.com/v1/users/${UserID}/friends?limit=100`,
        exhaust: true,
        filter: user => user,
    })

    const FriendsList = []

    for (const RawUser of RawFriends) {
        const Full = await getFullProfile(RawUser.id)
        if (Full) FriendsList.push(Full)
    }

    return {
        FriendCount: FriendsList.length,
        Friends: FriendsList,
    }
}

export default Friends
