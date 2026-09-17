import { ref, computed, onMounted, onUnmounted, inject, nextTick } from 'vue'

let zCounter = 10

export function useWindowPanel({ id, x, y, width, height, minWidth = 220, minHeight = 140 }) {
  const zoneRef = inject('zoneRef', null)
  const tileApi = inject('tileApi', null)

  const freePos = ref({ x, y })
  const freeSize = ref({ width, height })
  const zIndex = ref(++zCounter)

  const isTiled = computed(() => !!(tileApi && tileApi.rects.value[id]))
  const pos = computed(() => {
    if (!isTiled.value) return freePos.value
    const r = tileApi.rects.value[id]
    return { x: r.left, y: r.top }
  })
  const size = computed(() => (isTiled.value ? tileApi.rects.value[id] : freeSize.value))

  let dragState = null
  let resizeState = null
  let borderResizeAxis = null

  function bringToFront() {
    zIndex.value = ++zCounter
  }

  function zoneRect() {
    return zoneRef?.value ? zoneRef.value.getBoundingClientRect() : null
  }

  function clampToZone() {
    const rect = zoneRect()
    if (!rect || isTiled.value) return
    const maxX = Math.max(0, rect.width - freeSize.value.width)
    const maxY = Math.max(0, rect.height - freeSize.value.height)
    freePos.value.x = Math.min(Math.max(0, freePos.value.x), maxX)
    freePos.value.y = Math.min(Math.max(0, freePos.value.y), maxY)
  }

  function startDrag(e) {
    bringToFront()
    document.body.style.userSelect = 'none'

    // Undock immediately, like OS window snapping: the moment you grab a tiled
    // window it detaches and siblings reflow into the freed space right away.
    if (isTiled.value) {
      const r = tileApi.rects.value[id]
      freePos.value = { x: r.left, y: r.top }
      freeSize.value = { width: r.width, height: r.height }
      tileApi.remove(id)
    }

    dragState = { startX: e.clientX, startY: e.clientY, origX: freePos.value.x, origY: freePos.value.y }
    e.preventDefault()
  }

  function startResize(dir, e) {
    bringToFront()
    document.body.style.userSelect = 'none'

    if (isTiled.value && tileApi) {
      const edge = tileApi.getResizableEdge(id)
      if (edge === dir) {
        borderResizeAxis = dir === 'e' || dir === 'w' ? 'x' : 'y'
        e.preventDefault()
        e.stopPropagation()
        return
      }
      // No shared border on this handle (outer edge or a corner) — detach and
      // resize freely, same as a free-floating panel.
      const r = tileApi.rects.value[id]
      freePos.value = { x: r.left, y: r.top }
      freeSize.value = { width: r.width, height: r.height }
      tileApi.remove(id)
    }

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

    if (borderResizeAxis) {
      tileApi.resizeSplit(id, e.clientX, e.clientY)
      return
    }

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

      if (tileApi) {
        const target = tileApi.findTarget(id, e.clientX, e.clientY)
        tileApi.setPreview(target)
        dragState.target = target
      }
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
    if (dragState) {
      if (dragState.target && tileApi) {
        tileApi.insert(id, dragState.target)
      }
      if (tileApi) tileApi.setPreview(null)
    }
    dragState = null
    resizeState = null
    borderResizeAxis = null
    document.body.style.userSelect = ''
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  onMounted(() => {
    nextTick(clampToZone)
    if (tileApi) tileApi.registerPanel(id)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    if (tileApi) tileApi.unregisterPanel(id)
  })

  return { pos, size, zIndex, isTiled, startDrag, startResize, bringToFront }
}
