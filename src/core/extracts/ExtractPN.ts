import type {Element} from "domhandler";
import {extractTextAll, findFirstElement} from "@src/core/utils/dom";

export function extractPN(el: Element): string {
  const node = findFirstElement({tagName: 'pnr', nodes: el.children})
  if (!node) return '----'
  return extractTextAll({node})
}
