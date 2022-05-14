import {findFirstElement, getAttribute} from "@src/core/utils/dom";
import {convertModel} from "@src/core/convert/ConvertModel";
import {convertRevDate} from "@src/core/convert/ConvertRevDate";
import type {AipcHeader} from "@src/core/data/AipcHeader";
import type {Document, Element} from "domhandler";

export function extractAipcHeader(node: Document): AipcHeader {
  const aipcNode = findFirstElement({tagName: "aipc", nodes: node.children})
  const aipcElement = aipcNode as Element;
  return {
    doc: "AIPC",
    model: convertModel(getAttribute({attName: 'model', elem: aipcElement})),
    rev: convertRevDate(getAttribute({attName: 'revdate', elem: aipcElement})),
    op: getAttribute({attName: 'cus', elem: aipcElement}, '???')
  }
}

