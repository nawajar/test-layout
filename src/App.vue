<script setup>
import { ref } from 'vue'
import { useResizablePanel } from './composables/useResizablePanel'
import Zone from './components/Zone.vue'
import WindowPanel from './components/WindowPanel.vue'
import DietaryProfileEditable from './components/DietaryProfileEditable.vue'
import DietaryProfileSystem from './components/DietaryProfileSystem.vue'
import DataTable from './components/DataTable.vue'

const container = ref(null)
const { panelWidth, startDrag } = useResizablePanel(container, { initialWidth: 620, minWidth: 200 })
</script>

<template>
  <div id="container" ref="container" class="flex h-full w-full">

    <!-- LEFT ZONE -->
    <div id="leftZone" class="h-full bg-white" :style="{ width: panelWidth + 'px' }">
      <Zone>
        <WindowPanel id="section-1" title="Section 1" :x="16" :y="16" :width="360" :height="420">
          <DietaryProfileEditable />
        </WindowPanel>
        <WindowPanel id="section-2" title="Section 2" :x="392" :y="16" :width="360" :height="420">
          <DietaryProfileSystem />
        </WindowPanel>
      </Zone>
    </div>

    <!-- DRAG HANDLE -->
    <div
      id="dragHandle"
      class="w-1.5 h-full bg-gray-200 hover:bg-blue-400 cursor-col-resize flex-shrink-0"
      @mousedown="startDrag"
    ></div>

    <!-- RIGHT ZONE -->
    <div id="rightZone" class="flex-1 h-full bg-white">
      <Zone>
        <WindowPanel id="table" title="Table" :x="16" :y="16" :width="640" :height="360">
          <DataTable />
        </WindowPanel>
      </Zone>
    </div>

  </div>
</template>
