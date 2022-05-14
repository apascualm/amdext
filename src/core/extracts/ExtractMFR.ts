import type {Element} from "domhandler";
import {extractTextAll, findFirstElement} from "@src/core/utils/dom";

export function extractMFR(el: Element): string {
  const node = findFirstElement({tagName: 'mfr', nodes: el.children})
  if (!node) return '----'
  return extractTextAll({node})
}
