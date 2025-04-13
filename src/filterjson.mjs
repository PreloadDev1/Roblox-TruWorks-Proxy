export default async function filterJSON(params) {
    const results = [];
    let cursor = "";
    let done = false;

    try {
        while (!done) {
            const res = await fetch(`${params.url}&cursor=${cursor}`);
            if (!res.ok) break;

            const body = await res.json();
            if (!Array.isArray(body.data)) break;

            for (const item of body.data) {
                const result = await params.filter(item);
                if (result) results.push(result);
            }

            if (params.exhaust && body.nextPageCursor) {
                cursor = body.nextPageCursor;
            } else {
                done = true;
            }
        }
    } catch (err) {
        console.error("filterJSON error:", err);
    }

    return results;
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
    };
}
