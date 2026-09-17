// Immutable binary-split tree used to tile WindowPanels within a Zone.
// A node is either { type: 'leaf', id } or { type: 'split', dir: 'x'|'y', ratio, a, b }.
// dir 'x' splits left/right (a = left, b = right), dir 'y' splits top/bottom (a = top, b = bottom).

const EDGE_THRESHOLD = 32
const PANEL_EDGE_THRESHOLD = 18

function leaf(id) {
  return { type: 'leaf', id }
}

function split(dir, ratio, a, b) {
  return { type: 'split', dir, ratio, a, b }
}

export function computeRects(node, rect, out = {}) {
  if (!node) return out
  if (node.type === 'leaf') {
    out[node.id] = rect
    return out
  }
  if (node.dir === 'x') {
    const aw = rect.width * node.ratio
    computeRects(node.a, { left: rect.left, top: rect.top, width: aw, height: rect.height }, out)
    computeRects(node.b, { left: rect.left + aw, top: rect.top, width: rect.width - aw, height: rect.height }, out)
  } else {
    const ah = rect.height * node.ratio
    computeRects(node.a, { left: rect.left, top: rect.top, width: rect.width, height: ah }, out)
    computeRects(node.b, { left: rect.left, top: rect.top + ah, width: rect.width, height: rect.height - ah }, out)
  }
  return out
}

// Rect of the split node that directly contains `targetNode`, i.e. the union of its a/b children.
export function getNodeRect(node, targetNode, rect) {
  if (!node || node.type === 'leaf') return null
  if (node === targetNode) return rect
  const aRect = node.dir === 'x'
    ? { left: rect.left, top: rect.top, width: rect.width * node.ratio, height: rect.height }
    : { left: rect.left, top: rect.top, width: rect.width, height: rect.height * node.ratio }
  const bRect = node.dir === 'x'
    ? { left: rect.left + aRect.width, top: rect.top, width: rect.width - aRect.width, height: rect.height }
    : { left: rect.left, top: rect.top + aRect.height, width: rect.width, height: rect.height - aRect.height }
  return getNodeRect(node.a, targetNode, aRect) || getNodeRect(node.b, targetNode, bRect)
}

export function treeHasId(node, id) {
  if (!node) return false
  if (node.type === 'leaf') return node.id === id
  return treeHasId(node.a, id) || treeHasId(node.b, id)
}

export function findParentInfo(tree, leafId) {
  if (!tree || tree.type === 'leaf') return null
  if (tree.a.type === 'leaf' && tree.a.id === leafId) return { parent: tree, side: 'a' }
  if (tree.b.type === 'leaf' && tree.b.id === leafId) return { parent: tree, side: 'b' }
  return findParentInfo(tree.a, leafId) || findParentInfo(tree.b, leafId)
}

export function insertAtEdge(tree, targetId, newId, edge) {
  const dir = edge === 'left' || edge === 'right' ? 'x' : 'y'
  const first = edge === 'left' || edge === 'top'
  const newLeaf = leaf(newId)

  if (targetId === null) {
    if (!tree) return newLeaf
    return first ? split(dir, 0.5, newLeaf, tree) : split(dir, 0.5, tree, newLeaf)
  }

  function replace(node) {
    if (!node) return node
    if (node.type === 'leaf') {
      if (node.id !== targetId) return node
      const targetLeaf = leaf(targetId)
      return first ? split(dir, 0.5, newLeaf, targetLeaf) : split(dir, 0.5, targetLeaf, newLeaf)
    }
    const a = replace(node.a)
    if (a !== node.a) return { ...node, a }
    const b = replace(node.b)
    if (b !== node.b) return { ...node, b }
    return node
  }
  return replace(tree)
}

export function removeLeaf(tree, id) {
  if (!tree) return tree
  if (tree.type === 'leaf') return tree.id === id ? null : tree
  if (tree.a.type === 'leaf' && tree.a.id === id) return tree.b
  if (tree.b.type === 'leaf' && tree.b.id === id) return tree.a
  const a = removeLeaf(tree.a, id)
  const b = removeLeaf(tree.b, id)
  if (a === tree.a && b === tree.b) return tree
  return { ...tree, a, b }
}

export function setSplitRatio(tree, leafId, axis, ratio) {
  if (!tree || tree.type === 'leaf') return tree
  const aIsLeaf = tree.a.type === 'leaf' && tree.a.id === leafId
  const bIsLeaf = tree.b.type === 'leaf' && tree.b.id === leafId
  if ((aIsLeaf || bIsLeaf) && tree.dir === axis) {
    return { ...tree, ratio: Math.min(0.85, Math.max(0.15, ratio)) }
  }
  const a = setSplitRatio(tree.a, leafId, axis, ratio)
  const b = setSplitRatio(tree.b, leafId, axis, ratio)
  if (a === tree.a && b === tree.b) return tree
  return { ...tree, a, b }
}

// Which edge (if any) the cursor is close enough to for a snap, given the outer zone
// rect and the current px rects of already-tiled panels.
export function findSnapTarget({ zoneRect, rects, excludeId, clientX, clientY }) {
  const x = clientX - zoneRect.left
  const y = clientY - zoneRect.top
  if (x < 0 || y < 0 || x > zoneRect.width || y > zoneRect.height) return null

  if (x <= EDGE_THRESHOLD) return { parentId: null, edge: 'left' }
  if (x >= zoneRect.width - EDGE_THRESHOLD) return { parentId: null, edge: 'right' }
  if (y <= EDGE_THRESHOLD) return { parentId: null, edge: 'top' }
  if (y >= zoneRect.height - EDGE_THRESHOLD) return { parentId: null, edge: 'bottom' }

  for (const [id, r] of Object.entries(rects)) {
    if (id === excludeId) continue
    const withinY = y >= r.top && y <= r.top + r.height
    const withinX = x >= r.left && x <= r.left + r.width
    if (withinY && Math.abs(x - r.left) <= PANEL_EDGE_THRESHOLD) return { parentId: id, edge: 'left' }
    if (withinY && Math.abs(x - (r.left + r.width)) <= PANEL_EDGE_THRESHOLD) return { parentId: id, edge: 'right' }
    if (withinX && Math.abs(y - r.top) <= PANEL_EDGE_THRESHOLD) return { parentId: id, edge: 'top' }
    if (withinX && Math.abs(y - (r.top + r.height)) <= PANEL_EDGE_THRESHOLD) return { parentId: id, edge: 'bottom' }
  }
  return null
}

export function computePreviewRect(target, rects, zoneRect) {
  if (!target) return null
  const base = target.parentId === null
    ? { left: 0, top: 0, width: zoneRect.width, height: zoneRect.height }
    : rects[target.parentId]
  if (!base) return null
  const r = { ...base }
  if (target.edge === 'left') r.width = base.width / 2
  if (target.edge === 'right') { r.width = base.width / 2; r.left = base.left + base.width / 2 }
  if (target.edge === 'top') r.height = base.height / 2
  if (target.edge === 'bottom') { r.height = base.height / 2; r.top = base.top + base.height / 2 }
  return r
}
