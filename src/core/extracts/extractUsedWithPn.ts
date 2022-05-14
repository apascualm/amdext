import type {Element} from "domhandler";
import {extractTextAll, findElement} from "@src/core/utils/dom";

export function extractUsedWithPn(element: Element): string[] | undefined {
  const nodes = findElement({tagName: 'uwp', nodes: element.childNodes, recursive: true})
  if (!nodes || nodes.length <= 0) return;
  const result: string[] = [];
  nodes.forEach((node) => {
    const text = extractTextAll({node});
    result.push(text)
  })
  return result;
}
