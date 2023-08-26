import {ReaderAIPC} from "@src/readers/ReaderAIPC";
import {ReaderAMM} from "@src/readers/ReaderAMM";
import * as fs from "fs";

console.log(process.env)
if (true || process.env['NODE_ENV'] === 'dev') {
    //const aipc = new ReaderAIPC('./../../IPCA330')
    //aipc.read()
    const amm = new ReaderAMM('./raw/AMMA330')
    const data = amm.read()
    if (!fs.existsSync('./dist')) fs.mkdirSync('./dist')
    fs.writeFileSync('./dist/AMMA330.json', JSON.stringify(data, null, 4))
}


export {
    ReaderAIPC
}
