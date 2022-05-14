import type {effectivityRange} from "@src/core/data/EffectivityRange";
import type {AmmHeader} from "@src/core/data/AipcHeader";

export interface RefAMM {
  chap: string
  sect:string
  subj:string
  func:string
  seq: string
  pgblk:string
  conf?:string // Letter of different configuration "confltr"
  meth?:string // different method/technique for this configuration "confnbr"
}

export interface SubTask {
  effect: effectivityRange[]
  rev: Date
  ref: RefAMM
  content: string
  header: string
}

export interface Task extends Omit<SubTask, 'content'>{
  doc: AmmHeader
  subTask: SubTask[]
  zones?: string[]
  fin?: string[]
  tools?: string[]
  cml?: string[]
  ipc?: string[]
  loaded: Date
}
