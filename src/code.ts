import { CssStyle, buildCssString } from './buildCssString'

import { STORAGE_KEYS } from './storageKeys'
import { TextCount } from './getCssDataForTag'
import { UnitType } from './buildSizeStringByUnit'
import { UserComponentSetting } from './userComponentSetting'
import { buildCode } from './buildCode'
import { buildTagTree } from './buildTagTree'
import { messageTypes } from './messagesTypes'
import { modifyTreeForComponent } from './modifyTreeForComponent'

figma.showUI(__html__, { width: 800, height: 600 })

const selectedNodes = figma.currentPage.selection

async function generate(node: SceneNode, config: { cssStyle?: CssStyle; unitType?: UnitType }) {
  let cssStyle = config.cssStyle
  if (!cssStyle) {
    cssStyle = await figma.clientStorage.getAsync(STORAGE_KEYS.CSS_STYLE_KEY)

    if (!cssStyle) {
      cssStyle = 'css'
    }
  }

  let unitType = config.unitType
  if (!unitType) {
    unitType = await figma.clientStorage.getAsync(STORAGE_KEYS.UNIT_TYPE_KEY)

    if (!unitType) {
      unitType = 'px'
    }
  }

  const userComponentSettings: UserComponentSetting[] = (await figma.clientStorage.getAsync(STORAGE_KEYS.USER_COMPONENT_SETTINGS_KEY)) || []

  const textCount = new TextCount()

  const originalTagTree = buildTagTree(node, unitType, textCount)
  if (originalTagTree === null) {
    figma.notify('Please select a visible node')
    return
  }

  const tag = await modifyTreeForComponent(originalTagTree, figma)
  const generatedCodeStr = buildCode(tag, cssStyle)
  const cssString = buildCssString(tag, cssStyle)

  figma.ui.postMessage({ generatedCodeStr, cssString, cssStyle, unitType, userComponentSettings })
}

if (selectedNodes.length > 1) {
  figma.notify('Please select only 1 node')
  figma.closePlugin()
} else if (selectedNodes.length === 0) {
  figma.notify('Please select a node')
  figma.closePlugin()
} else {
  //generate(selectedNodes[0], {})
}

figma.ui.onmessage = (msg: messageTypes) => {
  if (msg.type === 'notify-copy-success') {
    figma.notify('copied to clipboard👍')
  }
  if (msg.type === 'new-css-style-set') {
    figma.clientStorage.setAsync(STORAGE_KEYS.CSS_STYLE_KEY, msg.cssStyle)
    generate(selectedNodes[0], { cssStyle: msg.cssStyle })
  }
  if (msg.type === 'new-unit-type-set') {
    figma.clientStorage.setAsync(STORAGE_KEYS.UNIT_TYPE_KEY, msg.unitType)
    generate(selectedNodes[0], { unitType: msg.unitType })
  }
  if (msg.type === 'update-user-component-settings') {
    figma.clientStorage.setAsync(STORAGE_KEYS.USER_COMPONENT_SETTINGS_KEY, msg.userComponentSettings)
    generate(selectedNodes[0], {})
  }
  if (msg.type === 'regen') {
    generate(figma.currentPage.selection[0], {})
  }
}
