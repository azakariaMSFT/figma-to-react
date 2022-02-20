import { CSSData, TextCount, getCssDataForTag } from './getCssDataForTag'

import { UnitType } from './buildSizeStringByUnit'
import { isImageNode } from './utils/isImageNode'

type Property = {
  name: string
  value: string
  notStringValue?: boolean
}

export type Tag = {
  name: string
  isText: boolean
  textCharacters: string | null
  isImg: boolean
  properties: Property[]
  css: CSSData
  children: Tag[]
  node: SceneNode
  isComponent?: boolean
}
const escapeHtml = (unsafe :string) => {
  return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
export function buildTagTree(node: SceneNode, unitType: UnitType, textCount: TextCount): Tag | null {
  if (!node.visible) {
    return null
  }

  const isImg = isImageNode(node)
  const properties: Property[] = []

  if (isImg) {
    properties.push({ name: 'src', value: '' })
  }

  const childTags: Tag[] = []
  if ('children' in node && !isImg) {
    node.children.forEach((child) => {
      const childTag = buildTagTree(child, unitType, textCount)
      if (childTag) {
        childTags.push(childTag)
      }
    })
  }

  if (node.type === 'TEXT') {
    const length = node.characters.length
    if (length > 0) {
      //const fonts = node.getRangeAllFontNames(0,length-1);
      let stringAccumulate = "";
     let currentFontName:FontName = node.getRangeFontName(0, 1) as FontName;
      let startIndex = 0
      Array.from(node.characters).forEach((value, index) => {
        const fontName:FontName = node.getRangeFontName(index, index + 1) as FontName;
        if (fontName.family === currentFontName.family
          && fontName.style === currentFontName.style) {
            
          stringAccumulate = stringAccumulate + escapeHtml(value);
        } else {
          //when the font change regen
          const childTag: Tag = {
            name: node.name,
            isText: true,
            textCharacters: stringAccumulate,
            isImg,
            css: getCssDataForTag(node, unitType, textCount, startIndex),
            properties,
            children: [],
            node
          }
          childTags.push(childTag);
          stringAccumulate= escapeHtml(value);
          currentFontName = fontName;
          startIndex=index;
        }
      })

      const tag: Tag = {
        name: isImg ? 'img' : node.name,
        isText: node.type === 'TEXT',
        textCharacters: stringAccumulate,
        isImg,
        css: getCssDataForTag(node, unitType, textCount, 0),
        properties,
        children: childTags,
        node
      }
      return tag;
    }
  } 

  const tag: Tag = {
    name: isImg ? 'img' : node.name,
    isText: node.type === 'TEXT',
    textCharacters: node.type === 'TEXT' ? node.characters : null,
    isImg,
    css: getCssDataForTag(node, unitType, textCount, 0),
    properties,
    children: childTags,
    node
  }
  return tag;
}

