import type {AipcHeader} from "@src/core/data/AipcHeader";

export interface Part {
  doc: AipcHeader
  ref: {
    chp: string
    sec: string
    unit: string
    fig: string
    item: string
  }
  fin?: string[] // a lot of pn haven't fin
  pn: string
  mfr: string
  upa: number
  alt?: string[] // alt P/N (only pn as array)
  uwp?: string[] // used with pn (uwp) usually an upper element
  designation: string // label
  effectivity: { from: number, to: number }[]
  ata: string // redundant?? or good for search
  pnrev: Date
  loaded: Date
}
