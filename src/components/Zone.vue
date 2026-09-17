<script setup>
import { ref, computed, provide } from 'vue'
import {
  computeRects,
  getNodeRect,
  findParentInfo,
  insertAtEdge,
  removeLeaf,
  setSplitRatio,
  findSnapTarget,
  computePreviewRect,
  treeHasId,
} from '../composables/useTileTree'

const zoneRef = ref(null)
provide('zoneRef', zoneRef)

const tree = ref(null)
const preview = ref(null)
const registeredIds = ref(new Set())

function registerPanel(id) {
  registeredIds.value.add(id)
}

function unregisterPanel(id) {
  registeredIds.value.delete(id)
  if (treeHasId(tree.value, id)) tree.value = removeLeaf(tree.value, id)
}

function zoneBounds() {
  if (!zoneRef.value) return null
  const r = zoneRef.value.getBoundingClientRect()
  return { left: 0, top: 0, width: r.width, height: r.height }
}

const rects = computed(() => {
  const bounds = zoneBounds()
  return bounds && tree.value ? computeRects(tree.value, bounds) : {}
})

// Snapping to an outer zone edge reflows every other free-floating panel in this
// zone into the space left behind, so the dragged panel never just hides them.
function insert(id, target) {
  let next = insertAtEdge(tree.value, target.parentId, id, target.edge)

  if (target.parentId === null) {
    const opposite = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[target.edge]
    const stackEdge = target.edge === 'left' || target.edge === 'right' ? 'bottom' : 'right'
    let anchorId = id
    let edge = opposite
    for (const otherId of registeredIds.value) {
      if (otherId === id || treeHasId(next, otherId)) continue
      next = insertAtEdge(next, anchorId, otherId, edge)
      anchorId = otherId
      edge = stackEdge
    }
  }

  tree.value = next
}

function remove(id) {
  tree.value = removeLeaf(tree.value, id)
}

function findTarget(id, clientX, clientY) {
  if (!zoneRef.value) return null
  return findSnapTarget({
    zoneRect: zoneRef.value.getBoundingClientRect(),
    rects: rects.value,
    excludeId: id,
    clientX,
    clientY,
  })
}

function setPreview(target) {
  const bounds = zoneBounds()
  preview.value = bounds ? computePreviewRect(target, rects.value, bounds) : null
}

// The one handle direction (if any) that drags the shared border with this leaf's
// direct BSP sibling, e.g. a leaf on the 'a' (left) side of an 'x' split borders its
// sibling on its 'e' edge.
function getResizableEdge(id) {
  const info = findParentInfo(tree.value, id)
  if (!info) return null
  if (info.parent.dir === 'x') return info.side === 'a' ? 'e' : 'w'
  return info.side === 'a' ? 's' : 'n'
}

function resizeSplit(id, clientX, clientY) {
  const bounds = zoneBounds()
  const info = findParentInfo(tree.value, id)
  if (!bounds || !info) return
  const parentRect = getNodeRect(tree.value, info.parent, bounds)
  if (!parentRect) return
  const ratio = info.parent.dir === 'x'
    ? (clientX - zoneRef.value.getBoundingClientRect().left - parentRect.left) / parentRect.width
    : (clientY - zoneRef.value.getBoundingClientRect().top - parentRect.top) / parentRect.height
  tree.value = setSplitRatio(tree.value, id, info.parent.dir, ratio)
}

provide('tileApi', { rects, insert, remove, findTarget, setPreview, getResizableEdge, resizeSplit, registerPanel, unregisterPanel })
</script>

<template>
  <div ref="zoneRef" class="relative h-full w-full overflow-auto">
    <slot />
    <div
      v-if="preview"
      class="pointer-events-none absolute bg-blue-400/20 border-2 border-blue-500 rounded z-[9999]"
      :style="{
        left: preview.left + 'px',
        top: preview.top + 'px',
        width: preview.width + 'px',
        height: preview.height + 'px',
      }"
    ></div>
  </div>
</template>
