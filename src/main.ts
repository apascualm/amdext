import {ReaderAIPC} from "@src/readers/ReaderAIPC";
import {ReaderAMM} from "@src/readers/ReaderAMM";
import * as fs from "fs";
import {ReaderMP} from "@src/readers/ReaderMP";

if (true || process.env['NODE_ENV'] === 'dev') {
    //const aipc = new ReaderAIPC('./../../IPCA330')
    //aipc.read()
    const amm = new ReaderMP('./raw/AIRBUS')
    const data = amm.read()
    if (!fs.existsSync('./dist')) fs.mkdirSync('./dist')
    fs.writeFileSync('./dist/AMMA350.json', JSON.stringify(data, null, 4))
}


export {
    ReaderAIPC,
    ReaderAMM,
    ReaderMP,
}
