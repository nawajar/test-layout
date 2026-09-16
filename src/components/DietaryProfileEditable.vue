<script setup>
import { ref } from 'vue'
import TagList from './TagList.vue'

const allergies = ref(['Shellfish', 'Peanuts'])
const dietaryRestrictions = ref([
  'Halal', 'Low Salt', 'Low Fat', 'Low Sugar', 'High Fiber', 'Gluten Free', 'Lactose Free', 'Vegetarian',
])
const eatingConditions = ref(['Dysphagia – Soft diet', 'Nausea', 'Poor appetite'])

const foodDDx = ref(false)
const diarrhea = ref(false)
const foodRestriction = ref(true)
const patientType = ref('Standard')

const feedingRoute = ref({
  tubeFeeding: false,
  oralSupplement: true,
  nilByMouth: false,
})

const notes = ref('')
</script>

<template>
  <div>
    <div class="grid items-start gap-3" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">

      <TagList label="Allergies" :tags="allergies" color-class="bg-red-50 text-red-600 border-red-200" />

      <TagList label="Dietary Restrictions" :tags="dietaryRestrictions" />

      <!-- Food DDx toggle -->
      <div class="flex items-center justify-between border border-gray-200 rounded px-3 py-2">
        <span class="text-xs font-medium text-gray-500 uppercase">Food DDx</span>
        <span class="text-xs text-gray-500">{{ foodDDx ? 'Yes' : 'No' }}</span>
      </div>

      <!-- Diarrhea toggle -->
      <div class="flex items-center justify-between border border-gray-200 rounded px-3 py-2">
        <span class="text-xs font-medium text-gray-500 uppercase">Diarrhea</span>
        <span class="text-xs text-gray-500">{{ diarrhea ? 'Yes' : 'No' }}</span>
      </div>

      <!-- Food Restriction -->
      <div class="border border-gray-200 rounded px-3 py-2">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase">Food Restriction</span>
          <span class="text-xs text-emerald-600 font-medium">{{ foodRestriction ? 'Yes' : 'No' }}</span>
        </div>
        <div class="flex gap-3 text-xs text-gray-600">
          <label class="flex items-center gap-1">
            <input type="radio" value="Standard" v-model="patientType" class="accent-emerald-600" />Standard
          </label>
          <label class="flex items-center gap-1">
            <input type="radio" value="VIP" v-model="patientType" class="accent-emerald-600" />VIP
          </label>
        </div>
      </div>

      <TagList
        label="Eating-Related Conditions"
        :tags="eatingConditions"
        color-class="bg-amber-50 text-amber-700 border-amber-200"
      />

      <!-- Feeding route checkboxes -->
      <div>
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Feeding Route</div>
        <div class="space-y-1 text-xs text-gray-600">
          <label class="flex items-center gap-1">
            <input type="checkbox" v-model="feedingRoute.tubeFeeding" class="accent-emerald-600" />Tube feeding
          </label>
          <label class="flex items-center gap-1">
            <input type="checkbox" v-model="feedingRoute.oralSupplement" class="accent-emerald-600" />Oral supplement required
          </label>
          <label class="flex items-center gap-1">
            <input type="checkbox" v-model="feedingRoute.nilByMouth" class="accent-emerald-600" />Nil by mouth
          </label>
        </div>
      </div>

      <!-- Notes -->
      <div class="col-span-full">
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Notes <span class="normal-case text-gray-400">(optional)</span>
        </div>
        <textarea
          v-model="notes"
          rows="2"
          class="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 resize-none"
          placeholder="Additional instructions or clinical notes..."
        ></textarea>
      </div>

    </div>
  </div>
</template>
