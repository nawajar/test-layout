<script setup>
import { ref } from 'vue'

const mainType = ref('Regular diet')
const dietaryAttribute = ref('Mechanical soft')
const diagnosis = ref('Type 2 Diabetes, Hypertension')

const foodDrugInteractions = ref([
  { name: 'Ciprobay 500 mg Tab.', detail: 'Ciprofloxacin hydrochloride monohydrate 500 mg tab' },
  { name: 'Micardis (40 mg) Tab.', detail: 'Telmisartan 40 mg tab' },
  { name: 'Zanidip 10 mg Tab.', detail: 'Lercanidipine hydrochloride 10 mg tab' },
])
</script>

<template>
  <div>
    <div class="mb-3">
      <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">From System</span>
    </div>
    <div class="grid items-start gap-3" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">

      <div>
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Main Type</div>
        <div class="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-gray-50">{{ mainType }}</div>
      </div>

      <div>
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dietary Attribute</div>
        <div class="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-gray-50">{{ dietaryAttribute }}</div>
      </div>

      <div>
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Diagnosis</div>
        <div class="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-gray-50">{{ diagnosis }}</div>
      </div>

      <div class="col-span-full">
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Food-Drug Interaction</div>
        <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
          <div
            v-for="item in foodDrugInteractions"
            :key="item.name"
            class="border border-gray-200 rounded px-3 py-2"
          >
            <div class="text-sm font-medium text-gray-700">{{ item.name }}</div>
            <div class="text-xs text-gray-400">{{ item.detail }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
