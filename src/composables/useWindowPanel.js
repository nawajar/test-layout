import { ref, onMounted, onUnmounted, inject, nextTick } from 'vue'

let zCounter = 10

export function useWindowPanel({ x, y, width, height, minWidth = 220, minHeight = 140 }) {
  const zoneRef = inject('zoneRef', null)

  const pos = ref({ x, y })
  const size = ref({ width, height })
  const zIndex = ref(++zCounter)

  let dragState = null
  let resizeState = null

  function bringToFront() {
    zIndex.value = ++zCounter
  }

  function zoneRect() {
    return zoneRef?.value ? zoneRef.value.getBoundingClientRect() : null
  }

  function clampToZone() {
    const rect = zoneRect()
    if (!rect) return
    const maxX = Math.max(0, rect.width - size.value.width)
    const maxY = Math.max(0, rect.height - size.value.height)
    pos.value.x = Math.min(Math.max(0, pos.value.x), maxX)
    pos.value.y = Math.min(Math.max(0, pos.value.y), maxY)
  }

  function startDrag(e) {
    bringToFront()
    document.body.style.userSelect = 'none'
    dragState = { startX: e.clientX, startY: e.clientY, origX: pos.value.x, origY: pos.value.y }
    e.preventDefault()
  }

  function startResize(dir, e) {
    bringToFront()
    document.body.style.userSelect = 'none'
    resizeState = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.value.x,
      origY: pos.value.y,
      origW: size.value.width,
      origH: size.value.height,
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
        const maxX = Math.max(0, rect.width - size.value.width)
        const maxY = Math.max(0, rect.height - size.value.height)
        newX = Math.min(Math.max(0, newX), maxX)
        newY = Math.min(Math.max(0, newY), maxY)
      }
      pos.value.x = newX
      pos.value.y = newY
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

      pos.value.x = newX
      pos.value.y = newY
      size.value.width = newW
      size.value.height = newH
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
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return { pos, size, zIndex, startDrag, startResize, bringToFront }
}
