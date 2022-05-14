import type {Element} from "domhandler";
import {extractTextAll, findFirstElement} from "@src/core/utils/dom";

export function extractUnitPerAssembly(node: Element): number {
  const nodeUPA = findFirstElement({tagName: 'upa', recursive: true, nodes: node.children})
  if (!nodeUPA) return 1;
  const amount = extractTextAll({node: nodeUPA})
  try {
    return Number.parseInt(amount)
  } catch (e) {
    return 1;
  }
}
