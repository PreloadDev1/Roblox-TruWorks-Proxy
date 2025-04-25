import fetch from "node-fetch"

export default async function FilterJSON(Parameters) {
    let Results = []
    let Cursor = ""

    try {
        while (true) {
            const Response = await fetch(`${Parameters.url}&cursor=${Cursor}`)
            if (!Response.ok) break

            const Body = await Response.json()

            for (const Row of Body.data) {
                const Result = Parameters.filter(Row)
                if (Result) {
                    Results.push(Result)
                }
            }

            if (Body.nextPageCursor && Parameters.exhaust) {
                Cursor = Body.nextPageCursor
            } else {
                break
            }
        }
    } catch (Error) {
        console.log(Error)
    }

    return Results
}

export function GetMarketInfo(Item) {
    return {
        ID: Item.id,
        Name: Item.name,
        Price: Item.price ?? 0,
    }
}

export function GetIdentificationInfo(Item) {
    return {
        ID: Item.id,
        Name: Item.name,
    }
}
