export default async function filterJSON(parameters) {
    let results = []

    try {
        let cursor = ""
        let done = false

        while (!done) {
            const response = await fetch(parameters.url + `&cursor=${cursor}`)
            if (!response.ok) break

            const body = await response.json()
            if (!body.data || !Array.isArray(body.data)) break

            for (const row of body.data) {
                const result = parameters.filter(row)
                if (result) results.push(result)
            }

            if (body.nextPageCursor && parameters.exhaust) {
                cursor = body.nextPageCursor
            } else {
                done = true
            }
        }
    } catch (error) {
        console.log(error)
    }

    return results
}

export function getMarketInfo(creatorType, creatorId) {
    return function(item) {
        if (!item || typeof item !== "object") return null;

        return {
            ID: item.id,
            Name: item.name,
            Price: item.price,
            CreatorType: creatorType,
            CreatorID: creatorId,
            Thumbnail: item.thumbnail?.imageUrl || null,
        };
    };
}

export function getIdentificationInfo(item) {
    return {
        ID: item.id,
        Name: item.name,
        Thumbnail: item.thumbnail?.imageUrl || null,
    }
}
