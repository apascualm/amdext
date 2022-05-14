import {readFileSync} from 'fs';
import {resolve} from 'path';
import {parseDocument} from "htmlparser2";
import type {Document} from 'domhandler'


export class ReaderXML {
  protected rawXML: string;
  readonly document: Document;

  constructor(path: string) {
    this.rawXML = readFileSync(resolve(path), "utf8");
    this.document = parseDocument(this.rawXML, {
      xmlMode: true,
      decodeEntities: true,
    });
  }
}
