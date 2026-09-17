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

const { pos, size, zIndex, isMaximized, startDrag, startResize, bringToFront, toggleMaximize } = useWindowPanel({
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
      @dblclick="toggleMaximize"
    >
      <span class="text-sm font-semibold text-gray-700">{{ title }}</span>
      <div class="flex items-center gap-1">
        <slot name="header-extra" />
        <button
          type="button"
          :title="isMaximized ? 'Restore' : 'Maximize'"
          class="flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          @mousedown.stop
          @click.stop="toggleMaximize"
        >
          <svg v-if="!isMaximized" width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="0.75" y="0.75" width="9.5" height="9.5" rx="1" stroke="currentColor" stroke-width="1.3" />
          </svg>
          <svg v-else width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="3" y="0.75" width="7.25" height="7.25" rx="1" stroke="currentColor" stroke-width="1.3" />
            <path d="M0.75 3.25V9.5a0.75 0.75 0 0 0 0.75 0.75H7.5" stroke="currentColor" stroke-width="1.3" fill="none" />
          </svg>
        </button>
      </div>
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
