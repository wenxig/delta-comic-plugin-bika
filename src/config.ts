import { Store } from 'delta-comic-core'
import { pluginName } from './symbol'
import type { bika } from './api'
export const config = (Store.useConfig().$useCustomConfig(pluginName, {
  imageQuality: {
    type: 'radio',
    comp: 'radio',
    defaultValue: <bika.ImageQuality>'original',
    info: '画质',
    selects: [{
      label: '大清',
      value: <bika.ImageQuality>'original',
    }, {
      label: '超清',
      value: <bika.ImageQuality>'high',
    }, {
      label: '高清',
      value: <bika.ImageQuality>'medium',
    }, {
      label: '标清',
      value: <bika.ImageQuality>'low',
    }]
  },
  doubleImage: {
    type: 'switch',
    info: '同时显示两张图片',
    defaultValue: false
  },
  preloadImage: {
    type: 'number',
    info: '图片预加载数量',
    defaultValue: 2,
    float: false,
    range: [1, 10]
  }
}))