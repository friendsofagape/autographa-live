import AutographaStore from "../components/AutographaStore";
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const readdir = promisify(fs.readdir);
const bibUtil_to_json = require(`${__dirname}/../util/usfm_to_json`);


export const getStuffAsync = (param) =>
    new Promise(function (resolve, reject) {
        bibUtil_to_json.toJson(param, (err, data) => {
            if (err !== null) reject(err);
            else resolve(data);
        });
    });

export const saveJsonToDb = (dir, bibleName, refLangCodeValue, refVersion) =>
    getNonDotFiles(importDir)
        .then(filePaths => filePaths.map((filePath) =>
            getStuffAsync({
                bibleName: bibleName,
                lang: refLangCodeValue.toLowerCase(),
                version: refVersion.toLowerCase(),
                usfmFile: filePath,
                targetDb: 'refs',
                scriptDirection: AutographaStore.refScriptDirection
            })
        ));

export const importTranslation = (importDir, langCode, langVersion) =>
    getNonDotFiles(importDir)
        .then(filePaths => filePaths.map((filePath) =>
            getStuffAsync({
                lang: langCode.toLowerCase(),
                version: langVersion.toLowerCase(),
                usfmFile: filePath,
                targetDb: 'target',
                scriptDirection: AutographaStore.refScriptDirection
            })
        ));

const getNonDotFiles = (dir) =>
    readdir(dir)
        .then(files => files.filter(f => !f.startsWith('.')))
        .then(files => files.map(relPath => path.join(dir, relPath)))
        .then(files => files.filter(f => fs.statSync(f).isFile()));
