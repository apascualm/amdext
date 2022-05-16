# AMDEXT

**AMDEXT** is a library for extract the data from de A/C manuals in AIB fleet. This library return an array of objects
with primitive data.

## Available Manuals
* AIPC for fleet AIB (A320, A330, A340)
* AMM for fleet AIB (A320, A330, A340)

## Part Object result

Basic Part Object:
```typescript
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
```
