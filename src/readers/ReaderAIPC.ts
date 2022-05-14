import path from "path";
import * as fs from "fs";
import {ReaderXML} from "@src/readers/ReaderXML";
import {findElement, findFirstElement} from "@src/core/utils/dom";
import {extractPnItem} from "@src/core/extracts/ExtractPnItem";
import type {AnyNode, Element} from "domhandler";
import {extractEffectivity} from "@src/core/extracts/ExtractEffectivity";
import type {Part} from "@src/core/data/Part";
import {extractAipcHeader} from "@src/core/extracts/ExtractAipcHeader";
import {nowZ} from "@src/core/utils/date";

export class ReaderAIPC {
  protected docPath: string
  protected xmlPath: string
  protected now:Date = nowZ();

  constructor(docPath: string, readonly target:string = path.resolve('./')) {
    this.docPath = docPath
    this.xmlPath = this.extractXMLPath(docPath)
    console.log(docPath)
    console.log(this.xmlPath)
  }

  private extractXMLPath(rootPath: string): string {
    const content = fs.readdirSync(path.resolve(rootPath, 'PDF'))
    const sgmlPath = content.find((file) => file.includes('SGML'))
    return path.resolve(rootPath, 'PDF', sgmlPath || '', 'XML')
  }

  read(): void {
    this.aipcReader()
  }

  /**
   * Not Implemented yet
   *
   * Vendors List
   * Read PDF/SGML/XML/ENVENDLIST.XML
   *
   * FIN List
   * Read PDF/SGML/XML/VIRTUAL/GENERAL_FIN
   */

  // read PDF/SGML/XML
  private aipcReader() {
    const result:Part[] = [];
    const content = fs.readdirSync(this.xmlPath)
    const onlyValid = content.filter((file) => /^EN\w+.xml$/.test(file))
    onlyValid.forEach((onefile)=> {
      const read = new ReaderXML(path.resolve(this.xmlPath, onefile))
      const list = findFirstElement({
        tagName: 'prtlist',
        nodes:read.document.children})
      if (!list) return
      const items = findElement({
        tagName: 'item',
        nodes: list.children
      })
      const aipcNode = findFirstElement({tagName: "aipc", nodes: read.document.children})
      const effect = extractEffectivity((aipcNode as Element).children)
      const aipc = extractAipcHeader(read.document)
      items.forEach((item)=> {
        const pn = extractPnItem(item as AnyNode, aipc, effect)

        // Only for test
        if (pn.pn === 'ASNA2083BG2-10' && pn.ref.chp === '32') {
          console.log(pn)
          console.log(effect)
        }
        result.push(pn)
      })
    })
    console.log(`Loaded ${result.length} pnr items.`)
    fs.writeFileSync(path.resolve(this.target, './pnr.json'), JSON.stringify(result, null, 2))
  }
}

