<script setup>
defineProps({
  label: { type: String, required: true },
  tags: { type: Array, required: true },
  colorClass: { type: String, default: 'bg-gray-100 text-gray-600 border-gray-200' },
})
</script>

<template>
  <div>
    <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{{ label }}</div>
    <div class="flex flex-wrap gap-1">
      <span
        v-for="tag in tags"
        :key="tag"
        :class="['px-2 py-0.5 rounded-full border text-xs', colorClass]"
      >{{ tag }}</span>
    </div>
  </div>
</template>
