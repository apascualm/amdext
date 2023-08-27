import path from "path";
import * as fs from "fs";
import type {RefMP, SubTask, SubTaskRefMP, Task} from "@src/core/data/Task";
import {ReaderXML} from "@src/readers/ReaderXML";
import type {Element} from "domhandler";
import {globalNowZ} from "@src/core/utils/date";
import {convertRevDate} from "@src/core/convert/ConvertRevDate";
import {extractText, findElement, findFirstElement, getAttribute} from "@src/core/utils/dom";
import {extractEffectivity} from "@src/core/extracts/ExtractEffectivity";
import * as console from "console";
import type {IToCSV} from "@src/readers/IToCSV";
import {stringify} from "csv-stringify/sync";
import type {MPTask} from "@src/core/data/Tables/MPTask";

function extractTitle(el: Element) {
    let titleNode = findFirstElement({tagName: 'title', nodes: el.children})
    if (!titleNode) {
        titleNode = findFirstElement({tagName: 'para', nodes: el.children})
        if (!titleNode) return 'unknown'
    }
    return extractText({node: titleNode});
}

function extractDmTitle(el: Element) {
    const titleNode = findFirstElement({tagName: 'infoName', nodes: el.children})
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

function extractIssueDate(el: Element): Date {
    const issueDateEl = findFirstElement({tagName: 'issueDate', nodes: el.children, recursive: true}) as Element
    return convertRevDate(getAttribute({
        attName: 'year',
        elem: issueDateEl
    }, '1700').concat(getAttribute({attName: 'month', elem: issueDateEl}, '01'), getAttribute({
        attName: 'day',
        elem: issueDateEl
    }, '01')))
}

function extractSubTasks(el: Element): SubTask[] {
    const result: SubTask[] = []
    const subtaskNodes = findElement({tagName: 'proceduralStepAlts', nodes: el.children, recursive: true})
    subtaskNodes.forEach((subTaskElement) => {
        const subtaskElement = findFirstElement({
            tagName: 'proceduralStep',
            nodes: (subTaskElement as Element).children
        }) as Element
        const subtaskId = getAttribute({attName: 'id', elem: subtaskElement}, '')
        const idMatch = subtaskId.match(/^st(\d{6})(\d+)/i)
        const subtask: SubTask = {
            header: extractTitle(subTaskElement as Element),
            ref: {
                systemComplete: idMatch ? idMatch[1] || '' : '',
                subTaskFunction: idMatch ? idMatch[2] || '' : '',
            },
            rev: new Date()
        }
        result.push(subtask)
    })
    return result
}

function extractTask(el: Element): Task {
    const indentElement = findFirstElement({tagName: 'dmIdent', nodes: el.children, recursive: true}) as Element
    const taskRef = findFirstElement({tagName: 'dmCode', nodes: indentElement.children}) as Element
    const operator = getAttribute({
        attName: 'extensionCode',
        elem: findFirstElement({tagName: 'identExtension', nodes: indentElement.children}) as Element
    }, '??')

    const task: Task = {
        ref: {
            modelIdentCode: getAttribute({attName: 'modelIdentCode', elem: taskRef}, '??'),
            systemDiffCode: getAttribute({attName: 'systemDiffCode', elem: taskRef}, '??'),
            systemCode: getAttribute({attName: 'systemCode', elem: taskRef}, '??'),
            subSystemCode: getAttribute({attName: 'subSystemCode', elem: taskRef}, '??'),
            subSubSystemCode: getAttribute({attName: 'subSubSystemCode', elem: taskRef}, '??'),
            assyCode: getAttribute({attName: 'assyCode', elem: taskRef}, '??'),
            disassyCode: getAttribute({attName: 'disassyCode', elem: taskRef}, '??'),
            disassyCodeVariant: getAttribute({attName: 'disassyCodeVariant', elem: taskRef}, '??'),
            infoCode: getAttribute({attName: 'infoCode', elem: taskRef}, '??'),
            infoCodeVariant: getAttribute({attName: 'infoCodeVariant', elem: taskRef}, '??'),
            itemLocationCode: getAttribute({attName: 'itemLocationCode', elem: taskRef}, '??'),
        },
        rev: extractIssueDate(el),
        doc: {
            doc: "MP",
            rev: extractIssueDate(el),
            op: operator,
            model: getAttribute({attName: 'modelIdentCode', elem: taskRef}, '??')
        },
        effect: extractEffectivity(el.children) || [],
        subTask: extractSubTasks(el),
        header: extractDmTitle(el),
        loaded: globalNowZ
    }

    const zoneListElement = findFirstElement({tagName: 'zonelst', nodes: el.children, recursive: true})
    if (zoneListElement) task.zones = extractZones(zoneListElement)

    const finListElement = findFirstElement({tagName: 'einlst', nodes: el.children, recursive: true})
    if (finListElement) task.fin = extractFIN(finListElement)
    return task;
}

export class ReaderMP implements IToCSV {
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
        const content = fs.readdirSync(path.resolve(rootPath, 'DATA'))
        const sgmlPath = content.find((file) => file.includes('MAINTENANCE_PROCEDURE'))
        return path.resolve(rootPath, 'DATA', sgmlPath || '')
    }

    read() {
        this.data = this.mpReader()
        return this.data;
    }

    // read PDF/SGML/XML
    private mpReader() {
        const result: Task[] = [];
        const content = fs.readdirSync(this.xmlPath)
        const onlyValid = content.filter((file) => {
            return /^DME.+\.XML$/i.test(file)
            // && !(/(_\w+).xml$/.test(file))
            // && !(/0000.xml$/i.test(file))
        })
        onlyValid.map((file, idx) => {
            const read = new ReaderXML(path.resolve(this.xmlPath, file));
            if (!read) return
            const taskNode = findFirstElement({
                tagName: 'dmodule',
                att: [{
                    attrName: 'xsi:noNamespaceSchemaLocation',
                    value: 'http://www.s1000d.org/S1000D_4-2/xml_schema_flat/proced.xsd'
                }],
                nodes: read.document.children
            }) as Element
            if (!taskNode) return
            const task = extractTask(taskNode)
            result.push(task)
            if (idx == 9526) {
                console.log('task: ')
                console.dir(task)
                console.dir(task.subTask)
            }
        })
        console.log(`Loaded ${result.length} Task items.`)
        return result
    }

    toCSV(): string {
        const table: MPTask[] = []
        if (!this.data) throw new Error('Exported not performed')
        this.data.forEach(task => {
            const taskRef: RefMP = task.ref as RefMP
            const tableItem: MPTask = {
                fleet: task.doc.model,
                loaded: task.loaded,
                operator: task.doc.op,
                rev: task.rev,
                title: task.header,
                type: 'MPTASK',
                modelIdentCode: taskRef.modelIdentCode,
                systemDiffCode: taskRef.systemDiffCode,
                systemCode: taskRef.systemCode,
                subSystemCode: taskRef.subSystemCode,
                subSubSystemCode: taskRef.subSubSystemCode,
                assyCode: taskRef.assyCode,
                disassyCode: taskRef.disassyCode,
                disassyCodeVariant: taskRef.disassyCodeVariant,
                infoCode: taskRef.infoCode,
                infoCodeVariant: taskRef.infoCodeVariant,
                itemLocationCode: taskRef.itemLocationCode,
            }
            table.push(tableItem)
            task.subTask.forEach(subTask => {
                const subTaskRef: SubTaskRefMP = subTask.ref as SubTaskRefMP
                const tableSubItem: MPTask = {
                    ...tableItem,
                    systemComplete: subTaskRef.systemComplete,
                    subTaskFunction: subTaskRef.subTaskFunction,
                    title: subTask.header,
                    type: 'MPSUBTASK'
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
                'modelIdentCode',
                'systemDiffCode',
                'systemCode',
                'subSystemCode',
                'subSubSystemCode',
                'assyCode',
                'disassyCode',
                'disassyCodeVariant',
                'infoCode',
                'infoCodeVariant',
                'itemLocationCode',
                'systemComplete',
                'subTaskFunction',
                'title',
                'loaded',
            ],
            cast: {
                date: (value: Date) => value.toISOString()
            },
            quote: true,
            quoted: true,
            encoding: "utf8"
        });
    }
}

