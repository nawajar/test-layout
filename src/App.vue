<script setup>
import { ref } from 'vue'
import Zone from './components/Zone.vue'
import WindowPanel from './components/WindowPanel.vue'
import DietaryProfileEditable from './components/DietaryProfileEditable.vue'
import DietaryProfileSystem from './components/DietaryProfileSystem.vue'
import DataTable from './components/DataTable.vue'

const zone = ref(null)
</script>

<template>
  <div id="container" class="relative h-full w-full">

    <!-- FLOATING ARRANGE TOOLBAR -->
    <div class="absolute top-3 right-3 z-[10000] flex gap-1 bg-white border border-gray-200 rounded-lg shadow-md p-1">
      <button
        type="button"
        title="Arrange in columns"
        class="flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        @click="zone.arrangeColumns()"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="2" width="3.5" height="12" rx="0.5" stroke="currentColor" stroke-width="1.2" />
          <rect x="6.25" y="2" width="3.5" height="12" rx="0.5" stroke="currentColor" stroke-width="1.2" />
          <rect x="11.5" y="2" width="3.5" height="12" rx="0.5" stroke="currentColor" stroke-width="1.2" />
        </svg>
      </button>
      <button
        type="button"
        title="Arrange in rows"
        class="flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        @click="zone.arrangeRows()"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="1" width="12" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1.2" />
          <rect x="2" y="6.25" width="12" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1.2" />
          <rect x="2" y="11.5" width="12" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1.2" />
        </svg>
      </button>
    </div>

    <Zone ref="zone">
      <WindowPanel id="section-1" title="Section 1" :x="16" :y="16" :width="360" :height="420">
        <DietaryProfileEditable />
      </WindowPanel>
      <WindowPanel id="section-2" title="Section 2" :x="392" :y="16" :width="360" :height="420">
        <DietaryProfileSystem />
      </WindowPanel>
      <WindowPanel id="table" title="Table" :x="768" :y="16" :width="480" :height="360">
        <DataTable />
      </WindowPanel>
    </Zone>

  </div>
</template>
