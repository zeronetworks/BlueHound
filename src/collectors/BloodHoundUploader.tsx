const {React} = require('react');
const {app} = require('electron');

const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/Pick');
const fs = require('fs');
const path = require('path');
const { createDriver } = require("use-neo4j");
const {isZipSync} = require('is-zip-file');
const AdmZip = require('adm-zip');
const sanitize = require('sanitize-filename');

const { batch } = require('stream-json/utils/Batch');
const NewIngestion = require('./newingestion.js');
const {streamArray} = require("stream-json/streamers/StreamArray");

let driver;
let filesCounter = 0;
let numberOfFiles = 0;
let numberOfFoundFiles = 0;
let neoVersion;
let toolId = 0;

const IngestFuncMap = {
    computers: NewIngestion.buildComputerJsonNew,
    groups: NewIngestion.buildGroupJsonNew,
    users: NewIngestion.buildUserJsonNew,
    domains: NewIngestion.buildDomainJsonNew,
    ous: NewIngestion.buildOuJsonNew,
    gpos: NewIngestion.buildGpoJsonNew,
    containers: NewIngestion.buildContainerJsonNew,
    azdevices: NewIngestion.buildAzureDevices,
    azusers: NewIngestion.buildAzureUsers,
    azgroups: NewIngestion.buildAzureGroups,
    aztenants: NewIngestion.buildAzureTenants,
    azsubscriptions: NewIngestion.buildAzureSubscriptions,
    azresourcegroups: NewIngestion.buildAzureResourceGroups,
    azvms: NewIngestion.buildAzureVMs,
    azkeyvaults: NewIngestion.buildAzureKeyVaults,
    azgroupowners: NewIngestion.buildAzureGroupOwners,
    azgroupmembers: NewIngestion.buildAzureGroupMembers,
    azvmpermissions: NewIngestion.buildAzureVmPerms,
    azrgpermissions: NewIngestion.buildAzureRGPermissions,
    azkvpermissions: NewIngestion.buildAzureKVPermissions,
    azkvaccesspolicies: NewIngestion.buildAzureKVAccessPolicies,
    azpwresetrights: NewIngestion.buildAzurePWResetRights,
    azgroupsrights: NewIngestion.buildAzureGroupRights,
    azglobaladminrights: NewIngestion.buildAzureGlobalAdminRights,
    azprivroleadminrights: NewIngestion.buildAzurePrivRileAdminRights,
    azapplicationadmins: NewIngestion.buildAzureApplicationAdmins,
    azcloudappadmins: NewIngestion.buildAzureCloudApplicationAdmins,
    azapplicationowners: NewIngestion.buildAzureAppOwners,
    azapplicationtosp: NewIngestion.buildAzureAppToSP,
};

const uploadData = async (statement, props) => {
    let session = driver.session();
    await session.run(statement, {props: props}).catch((err) => {
        console.log(statement);
        console.log(err);
    });
    await session.close();
};

const getMetaTagQuick = async (filePath) => {
    let size = fs.statSync(filePath).size;
    let start = size - 300;
    if (start <= 0) {
        start = 0;
    }

    //Try end of file first
    let prom = new Promise((resolve, reject) => {
        fs.createReadStream(filePath, {
            encoding: 'utf8',
            start: start,
            end: size,
        }).on('data', (chunk) => {
            let type, version, count;
            try {
                type = /"type.?:\s?"(\w*)"/g.exec(chunk)[1];
                count = parseInt(/"count.?:\s?(\d*)/g.exec(chunk)[1]);
            } catch (e) {
                type = null;
                count = null;
            }
            try {
                version = parseInt(/"version.?:\s?(\d*)/g.exec(chunk)[1]);
            } catch (e) {
                version = null;
            }

            resolve({
                count: count,
                type: type,
                version: version,
            });
        });
    });

    let meta = await prom;
    if (meta.type !== null && meta.count !== null) {
        return meta;
    }
    //Try the beginning of the file next
    prom = new Promise((resolve, reject) => {
        fs.createReadStream(filePath, {
            encoding: 'utf8',
            start: 0,
            end: 300,
        }).on('data', (chunk) => {
            let type, version, count;
            try {
                type = /type.?:\s+"(\w*)"/g.exec(chunk)[1];
                count = parseInt(/count.?:\s+(\d*)/g.exec(chunk)[1]);
            } catch (e) {
                type = null;
                count = null;
            }
            try {
                version = parseInt(/version.?:\s+(\d*)/g.exec(chunk)[1]);
            } catch (e) {
                version = null;
            }

            resolve({
                count: count,
                type: type,
                version: version,
            });
        });
    });

    meta = await prom;
    return meta;
};

const unzipFiles = async (files, event) => {
    let finalFiles = [];
    const tempPath = app.getPath('temp');
    for (let filePath of files) {
        //event.sender.send("tool-data", 0, 'Unzipping file ' + filePath + ' to ' + tempPath + '\n')
        if (isZipSync(filePath)) {
            try {
                const zip = new AdmZip(filePath);
                const zipEntries = zip.getEntries()
                for (let entry of zipEntries) {
                    if (!entry.entryName.endsWith('.json')) continue;

                    let sanitizedPath = sanitize(entry.entryName);
                    let output = path.join(tempPath, sanitizedPath);
                    zip.extractEntryTo(entry.entryName, tempPath, false, true, false, sanitizedPath)
                    finalFiles.push({
                        path: output,
                        delete: true
                    });
                }
            } catch (e) {
                event.sender.send("tool-data-error", toolId, e)
                return [];
            }
        }
    }
    return finalFiles;
};

const checkFileValidity = async (files, event) => {
    const filteredFiles = [];
    for (let file of files) {
        let meta = await getMetaTagQuick(file.path);
        const fileName = path.basename(file.path);

        if (!('version' in meta) || meta.version < 4) {
            event.sender.send("tool-data", toolId, 'Result file ' + fileName + ' is for a deprecated SharpHound version, skipping.\n')
            // InvalidVersion
            continue;
        }

        if (!Object.keys(IngestFuncMap).includes(meta.type)) {
            event.sender.send("tool-data", toolId, 'Bad type for result file ' + fileName + ', skipping.\n')
            // BadType
            continue;
        }

        filteredFiles.push({
            ...file,
            type: meta.type
        });
    }
    return filteredFiles;
};


const processJson = async (file, event) => {
    //event.sender.send("tool-data", 0, 'Uploading file: ' + file.path + '\n')

    const pipeline = chain([
        fs.createReadStream(file.path, {encoding: 'utf8'}),
        parser(),
        pick({filter: 'data'}),
        streamArray(),
        data => data.value,
        batch({batchSize: 200})
    ]);

    let count = 0;
    let processor = IngestFuncMap[file.type];
    pipeline.on('data', async (data) => {
        try{
            pipeline.pause()
            count += data.length

            let processedData = processor(data, event)
            for (let key in processedData){
                let props = processedData[key].props;
                if (props.length === 0) continue
                let chunked = props.chunk();
                let statement = processedData[key].statement;

                for (let chunk of chunked){
                    await uploadData(statement, chunk)
                }
            }

            file.progress = count

            pipeline.resume()
        }catch (e){
            console.error(e)
        }
        return null
    })

    pipeline.on('end', () => {
        //event.sender.send("tool-data", 0, 'Finished uploading file: ' + file.path + '\n')
        if (file.delete) {
            fs.unlinkSync(file.path)
        }

        console.timeEnd('IngestTime')
        //emitter.emit('refreshDBData')

        filesCounter += 1;
        if (filesCounter == numberOfFiles) {
            // finished processing all files
            postProcessUpload(event);
        }

        return null
    })
};

const postProcessUpload = async (event) => {
    let session = driver.session();

    const highValueSids = ["-544", "-500", "-512", "-516", "-518", "-519", "1-5-9", "-526", "-527"]
    const highValueStatement = "UNWIND $sids AS sid MATCH (n:Base) WHERE n.objectid ENDS WITH sid SET n.highvalue=true"

    await session.run(highValueStatement, {sids: highValueSids}).catch((err) => {
        console.log(err);
    });

    const baseOwnedStatement = "MATCH (n) WHERE n:User or n:Computer AND NOT EXISTS(n.owned) SET n.owned = false"
    await session.run(baseOwnedStatement, null).catch((err) => {
        console.log(err);
    });

    const baseHighValueStatement = "MATCH (n:Base) WHERE NOT EXISTS(n.highvalue) SET n.highvalue = false"
    await session.run(baseHighValueStatement, null).catch((err) => {
        console.log(err);
    });

    const dUsersSids = ["S-1-1-0", "S-1-5-11"]
    const domainUsersAssociationStatement = "MATCH (n:Group) WHERE n.objectid ENDS WITH '-513' OR n.objectid ENDS WITH '-515' WITH n UNWIND $sids AS sid MATCH (m:Group) WHERE m.objectid ENDS WITH sid MERGE (n)-[:MemberOf]->(m)"
    await session.run(domainUsersAssociationStatement, {sids: dUsersSids}).catch((err) => {
        console.log(err);
    });

    await session.close();
    console.log("Post processing done")
    event.sender.send("tool-data", toolId, 'Upload done, ' + numberOfFiles + '/' + numberOfFoundFiles + ' results files parsed successfully.')
    event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
}

async function deleteEdges(event) {
    let session = driver.session();
    let results = await session.run('MATCH ()-[r]-() WITH r LIMIT 100000 DELETE r RETURN count(r)')

    let count = results.records[0].get(0)
    await session.close()

    if (count == 0){
        event.sender.send("tool-data", toolId, 'Deleted edges.\n')
        await deleteNodes(event)
    }else{
        await deleteEdges(event)
    }

}

async function deleteNodes(event) {
    let session = driver.session();
    let results = await session.run('MATCH (n) WITH n LIMIT 100000 DELETE n RETURN count(n)')

    let count = results.records[0].get(0)
    await session.close()

    if (count == 0){
        event.sender.send("tool-data", toolId, 'Deleted nodes.\n')
        await dropConstraints(event)
    }else{
        await deleteNodes(event)
    }
}

async function dropConstraints(event) {
    let session = driver.session();
    let constraints = [];
    let result = await session.run('CALL db.constraints')

    for (let record of result.records){
        let constraint = record.get(0)
        let query;
        if (neoVersion.startsWith('3.')){
            query = 'DROP ' + constraint
        }else{
            query = 'DROP CONSTRAINT ' + constraint
        }

        constraints.push(query)
    }

    for (let constraintQuery of constraints){
        await session.run(constraintQuery)
    }

    await session.close()
    event.sender.send("tool-data", toolId, 'Dropped constraints.\n')
    await dropIndexes(event)
}

async function dropIndexes(event) {
    let session = driver.session();
    let indexes = [];

    let result = await session.run('CALL db.constraints')

    for (let record of result.records){
        let constraint = record.get(0)
        let query;
        if (neoVersion.startsWith('3.')){
            query = 'DROP ' + constraint
        }else{
            query = 'DROP INDEX ' + constraint
        }

        indexes.push(query)
    }

    for (let indexQuery of indexes){
        await session.run(indexQuery)
    }

    await session.close()
    event.sender.send("tool-data", toolId, 'Dropped indexes.\n')
    await setSchema(event)
}

async function setSchema(event) {
    const luceneIndexProvider = "lucene+native-3.0"
    let labels = ["User", "Group", "Computer", "GPO", "OU", "Domain", "Container", "Base", "AZApp", "AZDevice", "AZGroup", "AZKeyVault", "AZResourceGroup", "AZServicePrincipal", "AZTenant", "AZUser", "AZVM"]
    let azLabels = ["AZApp", "AZDevice", "AZGroup", "AZKeyVault", "AZResourceGroup", "AZServicePrincipal", "AZTenant", "AZUser", "AZVM"]
    let schema = {}
    for (let label of labels){
        schema[label] = {
            name: label,
            indexes: [{
                name: "{}_{}_index".format(label.toLowerCase(), "name"),
                provider: luceneIndexProvider,
                property: "name"
            }],
            constraints: [{
                name: "{}_{}_constraint".format(label.toLowerCase(), "objectid"),
                provider: luceneIndexProvider,
                property: "objectid"
            }],
        }
    }

    for (let label of azLabels) {
        schema[label]["indexes"].push({
            name: "{}_{}_index".format(label.toLowerCase(), "azname"),
            provider: luceneIndexProvider,
            property: "azname"
        })
    }

    let session = driver.session();

    for (let label of labels){
        for (let constraint of schema[label].constraints){
            let props = {
                name: constraint.name,
                label: [label],
                properties: [constraint.property],
                provider: constraint.provider
            }
            try{

                await session.run("CALL db.createUniquePropertyConstraint($name, $label, $properties, $provider)", props)
            }catch (e) {
                //console.error(e)
            }
        }

        for (let index of schema[label].indexes) {
            let props = {
                name: index.name,
                label: [label],
                properties: [index.property],
                provider: index.provider
            }
            try{

                await session.run("CALL db.createIndex($name, $label, $properties, $provider)", props)
            }catch (e) {
                //console.error(e)
            }

        }
    }

    await session.close();
    event.sender.send("tool-data", toolId, 'Schema set.\n')
}

const getNeoVersion = async () => {
    let session = driver.session();
    await session
        .run(
            'CALL dbms.components() YIELD versions RETURN versions[0] AS version'
        )
        .then((result) => {
            let record = result.records[0];
            neoVersion = record.get('version');
            session.close();
        });
}

const clearDatabase = async (event) => {
    await getNeoVersion();
    event.sender.send("tool-data", toolId, 'Clearing database...\n')
    await deleteEdges(event);
}

// @ts-ignore
async function handleSharpHoundResultsUpload(event, toolIdParam, resultsPath, connectionProperties, clearResults) {
    toolId = toolIdParam;
    try {
        driver = createDriver(connectionProperties['protocol'], connectionProperties['url'],
            connectionProperties['port'], connectionProperties['username'], connectionProperties['password'])

        if (!driver) {
            event.sender.send("tool-data-error", toolId, 'driver not defined.');
            event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
            return
        }

        event.sender.send("tool-data", toolId, '====================================\n')
        if (clearResults) await clearDatabase(event);
        event.sender.send("tool-data", toolId, 'Finished clearing database.\n')
        event.sender.send("tool-data", toolId, '====================================\n')

        numberOfFiles = 0;
        filesCounter = 0;

        if (fs.lstatSync(resultsPath).isFile()) {
            let validFiles = [];
            if (isZipSync(resultsPath)) {
                const unzippedJsonFiles = await unzipFiles([resultsPath], event);
                validFiles = await checkFileValidity(unzippedJsonFiles, event);
            }
            else {
                validFiles = await checkFileValidity([{path: resultsPath}], event);
            }

            numberOfFoundFiles = validFiles.length;
            numberOfFiles = validFiles.length;

            if (validFiles.length > 0) {
                for (const file of validFiles) {
                    await processJson(file, event)
                }
            } else {
                event.sender.send("tool-data", toolId, 'No result files found at: ' + resultsPath + '\n')
                event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
            }
        } else if (fs.lstatSync(resultsPath).isDirectory()) {
            fs.readdir(resultsPath, async function (err, files) {
                if (err) {
                    event.sender.send("tool-data-error", toolId, err)
                    event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
                } else {
                    const jsonFiles = [];
                    const zipFiles = [];
                    for (const file of files) {
                        const filePath = path.join(resultsPath, file);
                        if (file.endsWith('.json')) {
                            jsonFiles.push({path: filePath});

                        } else if (file.endsWith('_BloodHound.zip') || file.endsWith('-azurecollection.zip')) {
                            zipFiles.push(filePath)
                        }
                    }

                    event.sender.send("tool-data", toolId, 'Uploading result files from: ' + resultsPath + '\n')
                    const unzippedJsonFiles = await unzipFiles(zipFiles, event);
                    const foundFiles = jsonFiles.concat(unzippedJsonFiles);
                    numberOfFoundFiles = foundFiles.length;
                    const allFiles = await checkFileValidity(foundFiles, event);
                    numberOfFiles = allFiles.length;

                    if (numberOfFiles > 0) {
                        for (const file of allFiles) {
                            await processJson(file, event)
                        }
                    } else {
                        event.sender.send("tool-data", toolId, 'No result files found at: ' + resultsPath + '\n')
                        event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
                    }
                }
            });
        } else {
            event.sender.send("tool-data", toolId, 'Not a file or directory: ' + resultsPath + '\n')
            event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
        }
    } catch (e) {
        event.sender.send("tool-data-error", toolId, e)
        event.sender.send("tool-data", toolId, 'Upload done.')
        event.sender.send("sharphound-upload-done", toolId, numberOfFiles);
    }
}

module.exports = { handleSharpHoundResultsUpload };