import {find, getAttributeValue, existsOne, findOne, textContent, isText} from 'domutils';
import type {AnyNode, Element, Node} from "domhandler";
import type {AttributeFinder} from "@src/core/utils/AttributeFinder";
import type {Text} from "domhandler";

const filter = (tagName: string, att?: AttributeFinder[]) => {
  return (elem: Node | Element) => {
    let result = false;
    if (elem.type === 'tag') {
      const tag = elem as Element;
      if (tag.name === tagName) result = true;
      if (result && att) {
        result = att.every((at) => {
          if (!tag.attribs[at.attrName]) return false;
          if (!at.value) return true;
          return tag.attribs[at.attrName] === at.value;
        })
      }
    }
    return result
  }
}

export const clearText = (text:string) => {
  // console.log('Type text: ', typeof text, text)
  let result = text;
  result = result.replace(/\n/gm, ' ')
  result = result.replace(/\w {2,}\w/gm, (str) => {
    return str.replace(/ {2,}/gm, ' ');
  })
  return result.replace(/ {2,}/gm, ' ').trim();
}

export const findFirstElement = (options: { tagName: string, nodes: Node[], att?: AttributeFinder[], recursive?: boolean }) => {
  return findOne(filter(options.tagName, options.att),  options.nodes as AnyNode[], options.recursive);
}

export const findElement = (options: { tagName: string, nodes: Node[], att?: AttributeFinder[], recursive?: boolean, limit?: number }) => {
  return find(filter(options.tagName, options.att), options.nodes as AnyNode[], options.recursive || false, options.limit || 1000);
}

export const hasElement = (options:{tagName: string, nodes: Node[], att?: AttributeFinder[]}) => {
  return existsOne(filter(options.tagName, options.att), options.nodes as AnyNode[]);
}

export const extractTextAll = (options:{node: Node | Node[]}) => {
  return textContent(options.node as AnyNode);
}

export const extractText = (options:{node: Node }) => {
  let text = '';
  const el = options.node as Element;
  el.children.forEach((element)=> {
    if(isText(element)){
      text += (element as Text).data
    }
  })
  return clearText(text);
}

export const getAttribute = (options: { attName: string, elem: Element }, def: string = '') => {
  return getAttributeValue(options.elem, options.attName) || def;
}
