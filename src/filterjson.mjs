export default async function filterJSON(parameters) {
    let results = []

    try {
        let cursor = ""

        const response = await fetch(parameters.url + `&cursor=${cursor}`)
        if (!response.ok) {
            return
        }

        const body = await response.json()

        for (const row of body.data) {
            const result = parameters.filter(row)
            if (result) {
                results.push(result)
            }
        }

        if (body.nextPageCursor && parameters.exhaust) {
            cursor = body.nextPageCursor
        }

    } 
    catch (error) {
        console.log(error)
    }

    return results
}

export function getMarketInfo(creatorType, creatorId) {
    return function (item) {
        return {
            ID: item.id,
            Name: item.name,
            Price: item.price ?? null,
            CreatorType: creatorType,
            CreatorID: creatorId,
            Thumbnail: item.thumbnail?.imageUrl ?? null,
        }
    }
}

export function getIndentificationInfo(item) {
    return {
        id: item.id,
        name: item.name,
    }
}
