import { addScopeToNode } from 'alpinejs/src/scope.js'

export function slotsMagic(el) {
  while (el && !el._x_slots) el = el.parentElement
  return el?._x_slots
}

export function xComponentDirective(el, { expression, modifiers }) {
  const tagName = expression

  if (modifiers[0]) {
    const style = document.createElement('style')
    style.innerHTML = `${tagName} { display: ${modifiers[0]}}`
    document.head.appendChild(style)
  }

  if (window.customElements.get(tagName)) return

  window.customElements.define(
    tagName,
    class extends HTMLElement {
      connectedCallback() {
        const newEl = el.content.firstElementChild.cloneNode(true)

        const slotFills = collectSlotFills(this)
        this._x_slots = Object.fromEntries(
          [...slotFills.entries()].map(([name]) => [name, true])
        )

        const targetSlots = findSlots(newEl)

        for (const targetSlot of targetSlots) {
          const slotName = targetSlot.name || 'default'
          const fills = slotFills.get(slotName)

          const replacements = fills
            ? slotFills.get(slotName)
            : [...targetSlot.childNodes]

          targetSlot.replaceWith(...replacements)
        }

        this.replaceChildren(newEl)
      }
    }
  )
}

function findSlots(el) {
  if (el.tagName === 'SLOT') return [el]

  let slots = [...el.querySelectorAll('slot')]
  const templates = el.querySelectorAll('template')
  for (const template of templates) {
    if (template.getAttribute('x-component')) continue
    for (const child of template.content.children) {
      slots.push(...findSlots(child))
    }
  }
  return slots
}

function collectSlotFills(el) {
  const slots = new Map()

  for (const child of el.children) {
    if (child.tagName !== 'TEMPLATE') continue

    const rawSlotName = child.getAttribute('slot')
    const slotName = rawSlotName || 'default'
    if (!slots.has(slotName)) slots.set(slotName, [])

    const isSlotFill =
      !rawSlotName &&
      (child.getAttribute('x-for') || child.getAttribute('x-if'))

    slots
      .get(slotName)
      .push(...(isSlotFill ? [child] : child.content.childNodes))
  }

  return slots
}

export function xPropDirective(
  el,
  { value: propName, expression },
  { Alpine, cleanup }
) {
  let evaluate = Alpine.evaluateLater(el, expression)

  let setter
  if (safeLeftHandSide(expression)) {
    setter = Alpine.evaluateLater(el, `${expression} = __placeholder`)
  } else {
    setter = () => {}
  }

  if (!el._x_props) {
    el._x_props = {}
    addScopeToNode(el, el._x_props)
  }

  cleanup(() => {
    delete el._x_props[propName]
    if (Object.keys(el._x_props).length === 0) delete el._x_props
  })

  Object.defineProperty(el._x_props, propName, {
    enumerable: true,
    configurable: true,
    get() {
      let result
      evaluate((value) => (result = value))
      return result
    },
    set(value) {
      setter(() => {}, { scope: { __placeholder: value } })
    }
  })
}
function safeLeftHandSide(varName) {
  try {
    new Function(`var ${varName} = 1`)()
    return true
  } catch {
    return false
  }
}
