import filterJSON from "./FilterJson.mjs"

const Followers = {}

Followers.GetFollowerInfo = async function(UserID) {
    const FollowersList = await filterJSON({
        url: `https://friends.roblox.com/v1/users/${UserID}/followers?limit=100`,
        exhaust: true,
        filter: user => {
            return {
                UserID: user.id,
                Username: user.name,
                DisplayName: user.displayName,
                IsBanned: false,
                IsVerified: user.hasVerifiedBadge || false,
                Description: "",
                Created: {
                    Year: 0,
                    Month: 0,
                    Day: 0,
                    Hour: 0,
                    Minute: 0,
                    Second: 0,
                    Millisecond: 0,
                },
            }
        },
    })

    return {
        FollowerCount: FollowersList.length,
        Followers: FollowersList,
    }
}

export default Followers
