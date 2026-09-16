<script setup>
import { ref } from 'vue'

const rows = ref([
  { id: 1, name: 'Row One', status: 'Active', value: 120 },
  { id: 2, name: 'Row Two', status: 'Active', value: 85 },
  { id: 3, name: 'Row Three', status: 'Pending', value: 42 },
  { id: 4, name: 'Row Four', status: 'Active', value: 210 },
  { id: 5, name: 'Row Five', status: 'Inactive', value: 15 },
])
</script>

<template>
  <div>
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-200">
          <th class="text-left p-2 font-medium text-gray-600">ID</th>
          <th class="text-left p-2 font-medium text-gray-600">Name</th>
          <th class="text-left p-2 font-medium text-gray-600">Status</th>
          <th class="text-left p-2 font-medium text-gray-600">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100">
          <td class="p-2">{{ row.id }}</td>
          <td class="p-2">{{ row.name }}</td>
          <td class="p-2">{{ row.status }}</td>
          <td class="p-2">{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
