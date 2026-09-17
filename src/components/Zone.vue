<script setup>
import { ref, provide } from 'vue'

const zoneRef = ref(null)
provide('zoneRef', zoneRef)

const panels = new Map() // insertion-ordered: id -> setRect(rect)

function registerPanel(id, setRect) {
  panels.set(id, setRect)
}

function unregisterPanel(id) {
  panels.delete(id)
}

const GAP = 12

function arrangeColumns() {
  const rect = zoneRef.value?.getBoundingClientRect()
  const ids = [...panels.keys()]
  if (!rect || !ids.length) return
  const width = (rect.width - GAP * (ids.length + 1)) / ids.length
  ids.forEach((id, i) => {
    panels.get(id)({ x: GAP + i * (width + GAP), y: GAP, width, height: rect.height - GAP * 2 })
  })
}

function arrangeRows() {
  const rect = zoneRef.value?.getBoundingClientRect()
  const ids = [...panels.keys()]
  if (!rect || !ids.length) return
  const height = (rect.height - GAP * (ids.length + 1)) / ids.length
  ids.forEach((id, i) => {
    panels.get(id)({ x: GAP, y: GAP + i * (height + GAP), width: rect.width - GAP * 2, height })
  })
}

provide('poolApi', { registerPanel, unregisterPanel })
defineExpose({ arrangeColumns, arrangeRows })
</script>

<template>
  <div ref="zoneRef" class="relative h-full w-full overflow-auto bg-slate-100">
    <slot />
  </div>
</template>
