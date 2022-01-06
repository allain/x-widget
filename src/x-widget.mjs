import {
  addScopeToNode,
  closestDataStack,
  mergeProxies
} from 'alpinejs/src/scope.js'

export function slotsMagic(el) {
  while (el && !el._x_slots) el = el.parentElement
  return el?._x_slots
}

export function xWidgetDirective(el, { expression, modifiers }, { Alpine }) {
  const tagName = expression

  if (modifiers[0]) {
    const style = document.createElement('style')
    style.innerHTML = `${tagName} { display: ${modifiers[0]}}`
    document.head.appendChild(style)
  }

  // needed for knowing what widgets have already been defined
  if (Alpine._widgets) {
    Alpine._widgets.push(tagName)
  } else {
    Alpine._widgets = [tagName]
  }

  if (window.customElements.get(tagName)) return

  window.customElements.define(
    tagName,
    class extends HTMLElement {
      connectedCallback() {
        const newEl = el.content.firstElementChild.cloneNode(true)

        const slotFills = collectSlotFills(this)
        this._x_slots = Object.fromEntries(
          [...slotFills.entries()].map(([name, value]) => [name, value])
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

        later(() => {
          this.replaceChildren(newEl)
        })
      }
    }
  )
}

let blockStart = null
let queue = Promise.resolve()
const MAX_LOCK_TIME = 250
function later(fn) {
  queue = queue.then(() => {
    fn()
    if (blockStart === null) {
      blockStart = Date.now()
    } else if (Date.now() - blockStart > MAX_LOCK_TIME) {
      return new Promise((r) => {
        setTimeout(() => {
          blockStart = null
          r()
        }, 0)
      })
    }
  })
}

function findSlots(el) {
  let slots = [...el.querySelectorAll('slot')]
  if (el.tagName === 'SLOT') slots.unshift(el)
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
  { Alpine, cleanup, effect }
) {
  const propName = snakeToCamel(attribName)
  const propObj = Alpine.reactive({ [propName]: null })

  const read = Alpine.evaluateLater(el.parentElement, `() => ${expression}`)

  let setValue

  effect(() =>
    read((propValue) => {
      propObj[propName] = propValue
      setValue = undefined
    })
  )

  let removeScope
  if (safeLeftHandSide(el, expression)) {
    const setter = Alpine.evaluateLater(el.parentElement, `${expression} = __`)

    removeScope = addScopeToNode(
      el,
      new Proxy(propObj, {
        get(target, name) {
          return name !== propName || typeof setValue === 'undefined'
            ? target[name]
            : setValue
        },
        set(target, name, newValue) {
          if (name === propName) {
            setValue = newValue
            setter(() => {}, { scope: { __: newValue } })
          } else {
            target[name] = newValue
          }
          return true
        }
      })
    )
  } else {
    removeScope = addScopeToNode(el, propObj)
  }

  cleanup(() => removeScope)
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
