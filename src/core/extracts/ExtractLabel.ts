import type {Element} from "domhandler";
import {extractTextAll, findFirstElement} from "@src/core/utils/dom";

export function extractLabel(el: Element): string {
  const node = findFirstElement({tagName: 'lbl', nodes: el.children})
  if (!node) return '----'
  return extractTextAll({node})
}
