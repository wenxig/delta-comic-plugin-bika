import { Store } from 'delta-comic-core'
import { pluginName } from './symbol'
import type { bika } from './api'
export const config = (Store.useConfig().$useCustomConfig(pluginName, {
  imageQuality: <bika.ImageQuality>'original',

}))