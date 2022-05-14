import type {Element} from "domhandler";
import {extractTextAll, findElement} from "@src/core/utils/dom";

export function extractFIN(el: Element): string[] {
  const result: string[] = []
  const finNodeArray = findElement({tagName: 'ein', nodes: el.children})
  if (finNodeArray.length <= 0) return result
  finNodeArray.forEach((finNode) => {
    const rawText = extractTextAll({node: finNode})
    result.push(rawText.replaceAll('-', ''))
  })
  return result;
}
