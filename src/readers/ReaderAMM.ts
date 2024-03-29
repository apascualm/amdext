import path from "path";
import * as fs from "fs";
import type {RefAMM, SubTask, Task} from "@src/core/data/Task";
import {ReaderXML} from "@src/readers/ReaderXML";
import type {Element} from "domhandler";
import {globalNowZ} from "@src/core/utils/date";
import {convertRevDate} from "@src/core/convert/ConvertRevDate";
import {extractText, findElement, findFirstElement, getAttribute} from "@src/core/utils/dom";
import {extractEffectivity} from "@src/core/extracts/ExtractEffectivity";
import * as console from "console";
import type {IToCSV} from "@src/readers/IToCSV";
import type {AMMTask} from "@src/core/data/Tables/AMMTask";
import {stringify} from "csv-stringify/sync"

function extractTitle(el: Element) {
    const titleNode = findFirstElement({tagName: 'title', nodes: el.children})
    if (!titleNode) return 'unknown'
    return extractText({node: titleNode});
}

function extractTitleSubTask(el: Element) {
    const titleNode = findFirstElement({tagName: 'para', nodes: el.children})
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

function extractSubTasks(el: Element): SubTask[] {
    const result: SubTask[] = []
    const subtaskNodes = findElement({tagName: 'subtask', nodes: el.children, recursive: true})
    subtaskNodes.forEach((subTaskElement) => {
        const subtask: SubTask = {
            content: '',
            effect: extractEffectivity((subTaskElement as Element).children) || [],
            header: extractTitleSubTask(subTaskElement as Element),
            ref: {
                chap: getAttribute({attName: 'chapnbr', elem: subTaskElement as Element}, '??'),
                sect: getAttribute({attName: 'sectnbr', elem: subTaskElement as Element}, '??'),
                subj: getAttribute({attName: 'subjnbr', elem: subTaskElement as Element}, '??'),
                func: getAttribute({attName: 'func', elem: subTaskElement as Element}, '??'),
                seq: getAttribute({attName: 'seq', elem: subTaskElement as Element}, '??'),
                pgblk: getAttribute({attName: 'pgblknbr', elem: subTaskElement as Element}, '??'),
                conf: getAttribute({attName: 'confltr', elem: subTaskElement as Element}, '??'),
                meth: getAttribute({attName: 'confnbr', elem: subTaskElement as Element}, '??'),
            },
            rev: convertRevDate(getAttribute({attName: 'revdate', elem: subTaskElement as Element}, ''))

        }
        result.push(subtask)
    })
    return result
}

function extractTask(el: Element): Task {
    const operator = getAttribute({attName: 'cus', elem: el}, '???')
    const model = getAttribute({attName: 'model', elem: el}, 'A000')
    const fleetMatch = model.match(/A\d{3}/i)
    const fleet = fleetMatch ? fleetMatch[0] || 'A000' : model == 'TF-N' ? 'A320' : model
    el = findFirstElement({tagName: 'task', nodes: el.children}) as Element
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
            op: operator,
            model: fleet
        },
        effect: extractEffectivity(el.children) || [],
        subTask: extractSubTasks(el),
        header: extractTitle(el),
        loaded: globalNowZ
    }

    const zoneListElement = findFirstElement({tagName: 'zonelst', nodes: el.children, recursive: true})
    if (zoneListElement) task.zones = extractZones(zoneListElement)

    const finListElement = findFirstElement({tagName: 'einlst', nodes: el.children, recursive: true})
    if (finListElement) task.fin = extractFIN(finListElement)
    return task;
}

export class ReaderAMM implements IToCSV {
    protected docPath: string
    protected xmlPath: string
    protected data?: Task[]

    constructor(docPath: string, readonly target: string = path.resolve('./')) {
        this.docPath = docPath
        this.xmlPath = this.extractXMLPath(docPath)
        console.log('Doc Path: ', docPath)
        console.log('XML Path: ', this.xmlPath)
    }

    private extractXMLPath(rootPath: string): string {
        const content = fs.readdirSync(path.resolve(rootPath, 'PDF'))
        const sgmlPath = content.find((file) => file.includes('SGML'))
        return path.resolve(rootPath, 'PDF', sgmlPath || '', 'XML')
    }

    read() {
        this.data = this.ammReader()
        return this.data
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

        onlyValid.map((file, idx) => {
            const read = new ReaderXML(path.resolve(this.xmlPath, file));
            const taskNode = findFirstElement({tagName: 'amm', nodes: read.document.children}) as Element
            const task = extractTask(taskNode)
            result.push(task)
            if (idx == 120) {
                console.log('task: ')
                console.dir(task)
                console.dir(task.subTask)
            }
        })
        console.log(`Loaded ${result.length} Task items.`)
        return result
    }

    toCSV(): string {
        const table: AMMTask[] = []
        if (!this.data) throw new Error('Exported not performed')
        this.data.forEach(task => {
            const taskRef: RefAMM = task.ref as RefAMM
            const tableItem: AMMTask = {
                chap: taskRef.chap,
                conf: taskRef.conf,
                fleet: task.doc.model,
                func: taskRef.func,
                loaded: task.loaded,
                meth: taskRef.meth,
                operator: task.doc.op,
                pgblk: taskRef.pgblk,
                rev: task.rev,
                sect: taskRef.sect,
                seq: taskRef.seq,
                subj: taskRef.subj,
                title: task.header,
                type: 'AMMTASK'
            }
            table.push(tableItem)
            task.subTask.forEach(subTask => {
                const subTaskRef: RefAMM = subTask.ref as RefAMM
                const tableSubItem: AMMTask = {
                    ...tableItem,
                    sub_chap: subTaskRef.chap,
                    sub_sect: subTaskRef.sect,
                    sub_subj: subTaskRef.subj,
                    sub_func: subTaskRef.func,
                    sub_seq: subTaskRef.seq,
                    sub_pgblk: subTaskRef.pgblk,
                    sub_conf: subTaskRef.conf,
                    sub_meth: subTaskRef.meth,
                    title: subTask.header,
                    rev: subTask.rev,
                    type: 'AMMSUBTASK'
                }
                table.push(tableSubItem)
            })
        })

        return stringify(table, {
            header: true, delimiter: ',', columns: [
                'fleet',
                'operator',
                'rev',
                'type',
                'chap',
                'sect',
                'subj',
                'func',
                'seq',
                'pgblk',
                'conf',
                'meth',
                'sub_chap',
                'sub_sect',
                'sub_subj',
                'sub_func',
                'sub_seq',
                'sub_pgblk',
                'sub_conf',
                'sub_meth',
                'title',
                'loaded',
            ],
            cast: {
                date: (value) => value.toISOString()
            },
            quote: true,
            quoted: true,
            encoding: "utf8"
        });
    }
}

