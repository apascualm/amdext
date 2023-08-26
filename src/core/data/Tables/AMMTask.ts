interface AMMTask {
    fleet: string
    operator: string
    rev: Date
    type: 'TASK' | 'SUBTASK'
    chap: string
    sect: string
    subj: string
    func: string
    seq: string
    pgblk: string
    conf?: string
    meth?: string
    sub_chap?: string
    sub_sect?: string
    sub_subj?: string
    sub_func?: string
    sub_seq?: string
    sub_pgblk?: string
    sub_conf?: string
    sub_meth?: string
    title: string
    loaded: Date
}
