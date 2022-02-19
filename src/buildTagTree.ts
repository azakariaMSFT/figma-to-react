import { UnitType } from './buildSizeStringByUnit'
import { CSSData, getCssDataForTag, TextCount } from './getCssDataForTag'
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

  // if (node.type === 'TEXT') {
  //   const length = node.characters.length
  //   if (length > 0) {
  //     //const fonts = node.getRangeAllFontNames(0,length-1);
  //     let stringAccumulate = node.characters[0];
  //    let currentFontName = node.getRangeFontName(0, 1);
  //     let startIndex = 0
  //     Array.from(node.characters).forEach((value, index) => {
  //       const fontName = node.getRangeFontName(index, index + 1)
  //       if (fontName === currentFontName) {
  //         stringAccumulate = stringAccumulate + value;
  //       } else {
  //         //when the font change regen
  //         const childTag: Tag = {
  //           name: node.name,
  //           isText: true,
  //           textCharacters: stringAccumulate,
  //           isImg,
  //           css: getCssDataForTag(node, unitType, textCount, startIndex),
  //           properties,
  //           children: childTags,
  //           node
  //         }
  //         childTags.push(childTag);
  //         stringAccumulate="";
  //         currentFontName = fontName;
  //         startIndex=index;
  //       }
  //     })

  //     const tag: Tag = {
  //       name: isImg ? 'img' : node.name,
  //       isText: node.type === 'TEXT',
  //       textCharacters: null,
  //       isImg,
  //       css: getCssDataForTag(node, unitType, textCount, 0),
  //       properties,
  //       children: childTags,
  //       node
  //     }
  //     return tag;
  //   }
  // } 

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

