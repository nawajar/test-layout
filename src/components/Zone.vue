<script setup>
import { ref, provide } from 'vue'

const zoneRef = ref(null)
provide('zoneRef', zoneRef)
</script>

<template>
  <div ref="zoneRef" class="relative h-full w-full overflow-auto">
    <slot />
  </div>
</template>
