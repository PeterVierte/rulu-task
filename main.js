import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import iconv  from 'iconv-lite';
import * as fs from "fs";
import xml2js from 'xml2js';

const getInfo = async () => {
    try {
        const response = await fetch('http://www.cbr.ru/s/newbik');
        const buffer = await response.buffer();
        fs.writeFileSync('file.zip', buffer);

        const zip = new AdmZip('file.zip', {});
        const zipEntry = zip.getEntries()[0];
        const xmlBuffer = zipEntry.getData();
        const xmlString = iconv.decode(xmlBuffer, 'win1251');

        const parser = new xml2js.Parser();
        const parsedData = await parser.parseStringPromise(xmlString);
        const directory = parsedData['ED807']['BICDirectoryEntry'];

        const dataForDB = [];
        directory.forEach(item => {
            if(item.hasOwnProperty('Accounts')) {
                item['Accounts'].forEach(subItem => {
                    const info = {
                        bic: item['$']['BIC'],
                        name: item['ParticipantInfo'][0]['$']['NameP'],
                        corrAccount: subItem['$']['Account']
                    }
                    dataForDB.push(info);
                })
            }
        })

        return dataForDB;
    } catch (e) {
        console.log(e)
    }
}

getInfo();
