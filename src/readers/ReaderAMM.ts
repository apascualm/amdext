import path from "path";
import * as fs from "fs";
import type {Task} from "@src/core/data/Task";
import {ReaderXML} from "@src/readers/ReaderXML";
import type {Element} from "domhandler";
import {globalNowZ} from "@src/core/utils/date";
import {convertRevDate} from "@src/core/convert/ConvertRevDate";
import {extractText, findElement, findFirstElement, getAttribute} from "@src/core/utils/dom";
import {extractEffectivity} from "@src/core/extracts/ExtractEffectivity";

function extractTitle(el: Element) {
  const titleNode = findFirstElement({tagName: 'title', nodes: el.children})
  if (!titleNode) return 'unknown'
  return extractText({node: titleNode});
}

function extractZones(el: Element): string[] {
  const result: string[] = []
  const zoneElements = findElement({tagName: 'zone', nodes: el.children, recursive: true})
  zoneElements.forEach((zoneElement) => {
    const text = extractText({node: zoneElement})
    result.push(text)
  })
  return result;
}

function extractFIN(el: Element): string[] {
  const result: string[] = []
  const finElements = findElement({tagName: 'ein', nodes: el.children, recursive: true})
  finElements.forEach((finElement) => {
    const text = extractText({node: finElement})
    result.push(text)
  })
  return result;
}

function extractTask(el: Element): Task {
  // TODO doc debe de venir de amm NODE
  const task: Task = {
    ref: {
      chap: getAttribute({attName: 'chapnbr', elem: el}, '??'),
      sect: getAttribute({attName: 'sectnbr', elem: el}, '??'),
      subj: getAttribute({attName: 'subjnbr', elem: el}, '??'),
      func: getAttribute({attName: 'func', elem: el}, '??'),
      seq: getAttribute({attName: 'seq', elem: el}, '??'),
      pgblk: getAttribute({attName: 'pgblknbr', elem: el}, '??'),
      conf: getAttribute({attName: 'confltr', elem: el}, '??'),
      meth: getAttribute({attName: 'confnbr', elem: el}, '??'),
    },
    rev: convertRevDate(getAttribute({attName: 'revdate', elem: el}, '')),
    doc: {
      doc: "AMM",
      rev: convertRevDate(getAttribute({attName: 'revdate', elem: el}, '')),
      op: 'IBE',
      model: 'A330'
    },
    effect: extractEffectivity(el.children) || [],
    subTask: [],
    header: extractTitle(el),
    loaded: globalNowZ
  }

  const zoneListElement = findFirstElement({tagName: 'zonelst', nodes: el.children, recursive: true})
  if (zoneListElement) task.zones = extractZones(zoneListElement)

  const finListElement = findFirstElement({tagName: 'einlst', nodes: el.children, recursive: true})
  if (finListElement) task.fin = extractFIN(finListElement)
  return task;
}

export class ReaderAMM {
  protected docPath: string
  protected xmlPath: string

  constructor(docPath: string, readonly target: string = path.resolve('./')) {
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
    this.ammReader()
  }

  // read PDF/SGML/XML
  private ammReader() {
    const result: Task[] = [];
    const content = fs.readdirSync(this.xmlPath)
    const onlyValid = content.filter((file) => {
      return /^EN\d+.xml$/.test(file)
        && !(/(_\w+).xml$/.test(file))
        && !(/0000.xml$/.test(file))
    })
    const file = onlyValid[6034] || ''

    const read = new ReaderXML(path.resolve(this.xmlPath, file));
    const taskNode = findFirstElement({tagName: 'task', nodes: read.document.children}) as Element
    const task = extractTask(taskNode)
    console.log(task)
    console.log(`Loaded ${result.length} Task items.`)
  }
}

