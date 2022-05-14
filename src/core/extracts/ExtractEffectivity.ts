import {findFirstElement, getAttribute} from "@src/core/utils/dom";
import type {ChildNode, Element} from "domhandler";
import type {effectivityRange} from "@src/core/data/EffectivityRange";

/**
 * Get Array of effectities
 * If is an Array empty mean that is an 'USED WITH ALL NHA'
 * @param node
 */
export function extractEffectivity(node: ChildNode[]): effectivityRange[] | undefined {
  const result: effectivityRange[] = []
  const effectNode = findFirstElement({tagName: 'effect', nodes: node})
  if (!effectNode) return undefined
  const raw = getAttribute({attName: 'effrg', elem: effectNode as Element})
  if (!raw || raw.length <= 0) return undefined
  const rawList = raw.split(' ');
  rawList.forEach((item) => {
    const l = item.length;
    result.push({
      from: Number.parseInt(item.substring(0, l / 2)),
      to: Number.parseInt(item.substring(l / 2, l))
    })
  })
  return result;
}

