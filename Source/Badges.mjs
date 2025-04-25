import filterJSON from "./FilterJson.mjs"
import Games from "./Games.mjs"

const Badges = {}

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
                Created: parseDate(badge.created),
                Updated: parseDate(badge.updated),
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
