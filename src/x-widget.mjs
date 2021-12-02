import {
  addScopeToNode,
  closestDataStack,
  mergeProxies
} from 'alpinejs/src/scope.js'

export function slotsMagic(el) {
  while (el && !el._x_slots) el = el.parentElement
  return el?._x_slots
}

export function xWidgetDirective(el, { expression, modifiers }) {
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
        this.innerHTML = ''
        setTimeout(() => this.replaceChildren(newEl), 0)
      }
    }
  )
}

function findSlots(el) {
  if (el.tagName === 'SLOT') return [el]

  let slots = [...el.querySelectorAll('slot')]
  const templates = el.querySelectorAll('template')
  for (const template of templates) {
    if (template.getAttribute('x-widget')) continue
    for (const child of template.content.children) {
      slots.push(...findSlots(child))
    }
  }
  return slots
}

function collectSlotFills(el) {
  const slots = new Map()

  function collectForSlot(slotName, nodes) {
    if (slots.has(slotName)) {
      slots.get(slotName).push(...nodes)
    } else {
      slots.set(slotName, nodes)
    }
  }

  for (const child of el.childNodes) {
    if (child.tagName === 'TEMPLATE') {
      const slotName = child.getAttribute('slot')

      const isSlotFill =
        !slotName && (child.getAttribute('x-for') || child.getAttribute('x-if'))

      collectForSlot(
        slotName || 'default',
        isSlotFill ? [child] : [...child.content.childNodes]
      )
    } else if (child.nodeType !== Node.TEXT_NODE || child.textContent.trim()) {
      collectForSlot('default', [child])
    }
  }

  return slots
}

export function xPropDirective(
  el,
  { value: attribName, expression },
  { Alpine, cleanup }
) {
  const propName = snakeToCamel(attribName)
  let evaluate = Alpine.evaluateLater(el.parentElement, expression)

  let setter
  if (safeLeftHandSide(el, expression)) {
    setter = Alpine.evaluateLater(
      el.parentElement,
      `${expression} = __placeholder`
    )
  } else {
    setter = () => {}
  }

  if (!el._x_props) {
    el._x_props = {}
    el._x_props_cleanup = addScopeToNode(el, el._x_props)
  }

  cleanup(() => {
    if (!el._x_props) return

    delete el._x_props[propName]
    if (Object.keys(el._x_props).length === 0) {
      el._x_props_cleanup()
      delete el._x_props
      delete el._x_props_cleanup
    }
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

export function safeLeftHandSide(el, lhs) {
  try {
    let scope = mergeProxies(closestDataStack(el))
    new Function('scope', `with(scope) {${lhs} = ${lhs}}`)(scope)
    return true
  } catch {
    return false
  }
}

const snakeToCamel = (name) =>
  name.replace(/-([a-zA-Z])/g, (m) => m[1].toUpperCase() + m.substr(2))
