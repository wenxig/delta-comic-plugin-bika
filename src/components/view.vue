<script setup lang='ts'>
import { entries } from 'lodash-es'
import { watch } from 'vue'
import { BikaPage } from '@/api/page'
import { Utils } from 'delta-comic-core'
import { bika } from '@/api'
import { config as bikaConfig } from '@/config'
const $props = defineProps<{
  page: BikaPage
}>()
const imageQualityMap: Record<bika.ImageQuality, string> = {
  low: '标清',
  medium: '高清',
  high: '超清',
  original: '大清'
}

const smartAbortReloadAbortSignal = new Utils.request.SmartAbortController()
watch(() => bikaConfig['bika.imageQuality'], () => {
  smartAbortReloadAbortSignal.abort()
  $props.page.reloadAll(smartAbortReloadAbortSignal.signal)
})
const win = window
</script>

<template>
  <win.$view.images :page>
    <div>
      <VanPopover @select="q => bikaConfig['bika.imageQuality'] = q.label" placement="top-end" theme="dark"
        :actions="entries(imageQualityMap).map(v => ({ text: imageQualityMap[<bika.ImageQuality>v[0]], label: v[0] }))"
        class="!bg-transparent **:!overflow-hidden !overflow-hidden">
        <template #reference>
          <NButton text color="#fff">
            {{ imageQualityMap[<bika.ImageQuality>bikaConfig['bika.imageQuality']] }}
          </NButton>
        </template>
      </VanPopover>
    </div>
  </win.$view.images>
</template>