import { ref, computed, onMounted, onUnmounted, inject, nextTick } from 'vue'

let zCounter = 10

export function useWindowPanel({ id, x, y, width, height, minWidth = 220, minHeight = 140 }) {
  const zoneRef = inject('zoneRef', null)
  const poolApi = inject('poolApi', null)

  const freePos = ref({ x, y })
  const freeSize = ref({ width, height })
  const zIndex = ref(++zCounter)
  const isMaximized = ref(false)

  const pos = computed(() => (isMaximized.value ? { x: 0, y: 0 } : freePos.value))
  const size = computed(() => {
    if (!isMaximized.value) return freeSize.value
    const rect = zoneRect()
    return rect ? { width: rect.width, height: rect.height } : freeSize.value
  })

  let dragState = null
  let resizeState = null

  function bringToFront() {
    zIndex.value = ++zCounter
  }

  function toggleMaximize() {
    isMaximized.value = !isMaximized.value
    bringToFront()
  }

  function zoneRect() {
    return zoneRef?.value ? zoneRef.value.getBoundingClientRect() : null
  }

  function setRect({ x, y, width, height }) {
    isMaximized.value = false
    freePos.value = { x, y }
    freeSize.value = { width, height }
  }

  function clampToZone() {
    const rect = zoneRect()
    if (!rect) return
    const maxX = Math.max(0, rect.width - freeSize.value.width)
    const maxY = Math.max(0, rect.height - freeSize.value.height)
    freePos.value.x = Math.min(Math.max(0, freePos.value.x), maxX)
    freePos.value.y = Math.min(Math.max(0, freePos.value.y), maxY)
  }

  function startDrag(e) {
    bringToFront()
    document.body.style.userSelect = 'none'
    isMaximized.value = false

    dragState = { startX: e.clientX, startY: e.clientY, origX: freePos.value.x, origY: freePos.value.y }
    e.preventDefault()
  }

  function startResize(dir, e) {
    bringToFront()
    document.body.style.userSelect = 'none'
    isMaximized.value = false

    resizeState = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      origX: freePos.value.x,
      origY: freePos.value.y,
      origW: freeSize.value.width,
      origH: freeSize.value.height,
    }
    e.preventDefault()
    e.stopPropagation()
  }

  function onMouseMove(e) {
    const rect = zoneRect()

    if (dragState) {
      const dx = e.clientX - dragState.startX
      const dy = e.clientY - dragState.startY
      let newX = dragState.origX + dx
      let newY = dragState.origY + dy

      if (rect) {
        const maxX = Math.max(0, rect.width - freeSize.value.width)
        const maxY = Math.max(0, rect.height - freeSize.value.height)
        newX = Math.min(Math.max(0, newX), maxX)
        newY = Math.min(Math.max(0, newY), maxY)
      }
      freePos.value.x = newX
      freePos.value.y = newY
      return
    }

    if (resizeState) {
      const { dir, startX, startY, origX, origY, origW, origH } = resizeState
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      let newX = origX
      let newY = origY
      let newW = origW
      let newH = origH

      if (dir.includes('e')) {
        newW = Math.max(minWidth, origW + dx)
        if (rect) newW = Math.min(newW, rect.width - origX)
      }
      if (dir.includes('s')) {
        newH = Math.max(minHeight, origH + dy)
        if (rect) newH = Math.min(newH, rect.height - origY)
      }
      if (dir.includes('w')) {
        let w = Math.max(minWidth, origW - dx)
        let x = origX + (origW - w)
        if (x < 0) {
          w += x
          x = 0
        }
        newW = w
        newX = x
      }
      if (dir.includes('n')) {
        let h = Math.max(minHeight, origH - dy)
        let y = origY + (origH - h)
        if (y < 0) {
          h += y
          y = 0
        }
        newH = h
        newY = y
      }

      freePos.value.x = newX
      freePos.value.y = newY
      freeSize.value.width = newW
      freeSize.value.height = newH
    }
  }

  function onMouseUp() {
    dragState = null
    resizeState = null
    document.body.style.userSelect = ''
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  onMounted(() => {
    nextTick(clampToZone)
    if (poolApi) poolApi.registerPanel(id, setRect)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    if (poolApi) poolApi.unregisterPanel(id)
  })

  return { pos, size, zIndex, isMaximized, startDrag, startResize, bringToFront, toggleMaximize }
}
