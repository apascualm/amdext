import type {AnyNode, Element} from "domhandler";
import type {Part} from "@src/core/data/Part";
import type {effectivityRange} from "@src/core/data/EffectivityRange";
import type {AipcHeader} from "@src/core/data/AipcHeader";
import {getAttribute} from "@src/core/utils/dom";
import {extractUnitPerAssembly} from "@src/core/extracts/ExtractUnitPerAssembly";
import {extractEffectivity} from "@src/core/extracts/ExtractEffectivity";
import {convertRevDate} from "@src/core/convert/ConvertRevDate";
import {globalNowZ} from "@src/core/utils/date";
import {extractUsedWithPn} from "@src/core/extracts/extractUsedWithPn";
import {extractLabel} from "@src/core/extracts/ExtractLabel";
import {extractPN} from "@src/core/extracts/ExtractPN";
import {extractMFR} from "@src/core/extracts/ExtractMFR";
import {extractFIN} from "@src/core/extracts/ExtractFIN";

export function extractPnItem(nodeRaw: AnyNode, aipc: AipcHeader, effect: effectivityRange[] | undefined = []): Part {

  function nodeElement(): Element {
    return nodeRaw as Element
  }

  const part: Part = {
    ref: {
      chp: getAttribute({attName: 'chapnbr', elem: nodeElement()}, '??'),
      sec: getAttribute({attName: 'sectnbr', elem: nodeElement()}, '??'),
      unit: getAttribute({attName: 'unitnbr', elem: nodeElement()}, '??'),
      fig: getAttribute({attName: 'fignbr', elem: nodeElement()}, '??'),
      item: getAttribute({attName: 'itemnbr', elem: nodeElement()}, '???')
    },
    pn: extractPN(nodeElement()),
    mfr: extractMFR(nodeElement()),
    fin: extractFIN(nodeElement()),
    designation: extractLabel(nodeElement()),
    doc: aipc,
    upa: extractUnitPerAssembly(nodeElement()),
    ata: getAttribute({attName: 'chapnbr', elem: nodeElement()}) || '??',
    effectivity: extractEffectivity(nodeElement().children) || effect,
    pnrev: convertRevDate(getAttribute({attName: 'revdate', elem: nodeElement()})),
    loaded: globalNowZ
  };

  const uwp = extractUsedWithPn(nodeElement());
  if (uwp) part.uwp = uwp;
  return part;
}

