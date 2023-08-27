export interface AMMTask {
    fleet: string
    operator: string
    rev: Date
    type: 'AMMTASK' | 'AMMSUBTASK'
    chap: string
    sect: string
    subj: string
    func: string
    seq: string
    pgblk: string
    conf?: string | undefined
    meth?: string | undefined
    sub_chap?: string | undefined
    sub_sect?: string | undefined
    sub_subj?: string | undefined
    sub_func?: string | undefined
    sub_seq?: string | undefined
    sub_pgblk?: string | undefined
    sub_conf?: string | undefined
    sub_meth?: string | undefined
    title: string
    loaded: Date
}
