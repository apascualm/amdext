import {ReaderAIPC} from "@src/readers/ReaderAIPC";
import {ReaderAMM} from "@src/readers/ReaderAMM";

console.log(process.env)
if (true || process.env['NODE_ENV'] === 'dev'){
  //const aipc = new ReaderAIPC('./../../IPCA330')
  //aipc.read()

  const amm = new ReaderAMM('./../../AMMA330')
  amm.read()
}


export {
  ReaderAIPC
}
