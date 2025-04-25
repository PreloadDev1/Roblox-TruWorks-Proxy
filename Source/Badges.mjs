import filterJSON from "./FilterJson.mjs"
import Games from "./Games.mjs"

const Badges = {}

Badges.GetBadgeInfo = async function(UserID) {
    const BadgesList = await filterJSON({
        url: `https://badges.roblox.com/v1/users/${UserID}/badges?limit=100&sortOrder=Desc`,
        exhaust: true,
        filter: badge => {
            return {
                ID: badge.id,
                Name: badge.name,
                Description: badge.description,
                AwardedCount: badge.awardedCount,
                WinRatePercentage: badge.winRatePercentage,
                Created: badge.created,
                Updated: badge.updated,
                PlaceID: badge.statistics.placeId,
                UniverseID: badge.statistics.universeId,
            }
        },
    })

    for (const Badge of BadgesList) {
        const GameInfo = await Games.getByUniverseId(Badge.UniverseID)
        Badge.GameInfo = GameInfo
    }

    return {
        BadgeCount: BadgesList.length,
        Badges: BadgesList,
    }
}

export default Badges
