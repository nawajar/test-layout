<script setup>
import { useWindowPanel } from '../composables/useWindowPanel'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  x: { type: Number, default: 20 },
  y: { type: Number, default: 20 },
  width: { type: Number, default: 360 },
  height: { type: Number, default: 320 },
  minWidth: { type: Number, default: 220 },
  minHeight: { type: Number, default: 140 },
})

const { pos, size, zIndex, startDrag, startResize, bringToFront } = useWindowPanel({
  id: props.id,
  x: props.x,
  y: props.y,
  width: props.width,
  height: props.height,
  minWidth: props.minWidth,
  minHeight: props.minHeight,
})

const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
</script>

<template>
  <div
    class="absolute flex flex-col bg-white border border-gray-200 rounded shadow-sm"
    :style="{
      left: pos.x + 'px',
      top: pos.y + 'px',
      width: size.width + 'px',
      height: size.height + 'px',
      zIndex,
    }"
    @mousedown.capture="bringToFront"
  >
    <div
      class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t cursor-move select-none flex-shrink-0"
      @mousedown="startDrag"
    >
      <span class="text-sm font-semibold text-gray-700">{{ title }}</span>
      <slot name="header-extra" />
    </div>

    <div class="flex-1 overflow-auto p-4">
      <slot />
    </div>

    <div
      v-for="dir in handles"
      :key="dir"
      :class="['resize-handle', `resize-${dir}`]"
      @mousedown.stop="startResize(dir, $event)"
    ></div>
  </div>
</template>

<style scoped>
.resize-handle {
  position: absolute;
}
.resize-n {
  top: -3px;
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: ns-resize;
}
.resize-s {
  bottom: -3px;
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: ns-resize;
}
.resize-e {
  top: 8px;
  bottom: 8px;
  right: -3px;
  width: 6px;
  cursor: ew-resize;
}
.resize-w {
  top: 8px;
  bottom: 8px;
  left: -3px;
  width: 6px;
  cursor: ew-resize;
}
.resize-ne {
  top: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  cursor: nesw-resize;
}
.resize-nw {
  top: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}
.resize-se {
  bottom: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}
.resize-sw {
  bottom: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  cursor: nesw-resize;
}
</style>
