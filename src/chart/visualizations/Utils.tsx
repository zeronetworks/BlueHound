import { QueryResult, Record as Neo4jRecord } from 'neo4j-driver'

export function recordToNative(input: any): any {
    if ( !input && input !== false ) {
        return null
    }
    else if ( typeof input.keys === 'object' && typeof input.get === 'function' ) {
        return Object.fromEntries(input.keys.map(key => [ key, recordToNative(input.get(key)) ]))
    }
    else if ( typeof input.toNumber === 'function' ) {
        return input.toNumber()
    }
    else if ( Array.isArray(input) ) {
        return (input as Array<any>).map(item => recordToNative(item))
    }
    else if ( typeof input === 'object' ) {
        const converted = Object.entries(input).map(([ key, value ]) => [ key, recordToNative(value) ])

        return Object.fromEntries(converted)
    }

    return input
}

export function resultToNative(result: QueryResult): Record<string, any> {
    if (!result) return {}

    return result.records.map(row => recordToNative(row))
}
export function checkResultKeys(first: Neo4jRecord, keys: string[]) {
    const missing = keys.filter(key => !first.keys.includes(key))

    if ( missing.length > 0 ) {
        return new Error(`The query is missing the following key${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.  The expected keys are: ${keys.join(', ')}`)
    }

    return false
}