import { ref, onUnmounted } from 'vue'

export function useResizablePanel(containerRef, { initialWidth = 300, minWidth = 40 } = {}) {
  const panelWidth = ref(initialWidth)
  const dragging = ref(false)

  function startDrag() {
    dragging.value = true
    document.body.style.userSelect = 'none'
  }

  function onDrag(e) {
    if (!dragging.value || !containerRef.value) return
    const containerRect = containerRef.value.getBoundingClientRect()
    let newWidth = e.clientX - containerRect.left

    const min = minWidth
    const max = containerRect.width - minWidth
    newWidth = Math.max(min, Math.min(max, newWidth))

    panelWidth.value = newWidth
  }

  function stopDrag() {
    dragging.value = false
    document.body.style.userSelect = ''
  }

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)

  onUnmounted(() => {
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)
  })

  return { panelWidth, startDrag }
}
