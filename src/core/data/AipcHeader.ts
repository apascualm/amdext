export interface MainHeader {
  doc: string
  model: string
  rev: Date // Revision of the doc
  op: string // Operator
}

export interface AipcHeader extends MainHeader{
  doc: 'AIPC'
}

export interface AmmHeader extends MainHeader {
  doc: 'AMM' | 'MP'
}

export interface TsmHeader extends MainHeader {
  doc: 'TSM'
}
