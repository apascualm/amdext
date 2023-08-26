interface MPTask {
    fleet: string
    operator: string
    rev: Date
    type: 'TASK' | 'SUBTASK'
    modelIdentCode: string
    systemDiffCode:string
    systemCode:string
    subSystemCode:string
    subSubSystemCode: string
    assyCode:string
    disassyCode:string
    disassyCodeVariant:string
    infoCode:string
    infoCodeVariant:string
    itemLocationCode:string
    systemComplete?: string
    subTaskFunction?:string
    title: string
    loaded: Date
}
