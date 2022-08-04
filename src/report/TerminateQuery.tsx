export const terminateQuery = async (driver, database, query) => {
    const session = (database) ? driver.session({ database: database }) : driver.session();

    const getQueryIds = async (query={}) => {
        let results = null;
        try {
            results = await session.run("CALL dbms.listQueries() YIELD queryId, query, status WHERE status = \"running\" AND query = $queryName RETURN queryId", {queryName: query})
        } catch (e) {
            console.log(e)
        }
        if (!results) return [];

        const queryIds = results.records.map(record => {
            return record.get('queryId')
        })
        return queryIds;
    }

    const terminateQueries = async (queryIds) => {
        const results = await session.run("CALL dbms.killQueries($queryIds)", {queryIds: queryIds})
        await session.close();

        const terminatedQueries = results.records.map(record => {
            if (record.get('message') == 'Query found') return record.get('queryId');
        })

        let difference = queryIds.filter(item => terminatedQueries.indexOf(item) < 0);
        if (difference.length == 0) return true;
        return false;
    }

    const queryIds = await getQueryIds(query);
    if (queryIds.length > 0) {
        return await terminateQueries(queryIds);
    } else {
        await session.close();
        return true;
    }
}