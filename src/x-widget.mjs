export function slotsMagic(el) {
  while (el && !el._x_slots) el = el.parentElement
  return el?._x_slots
}

export function xWidgetDirective(el, { expression, modifiers }, { Alpine }) {
  const tagName = expression

  if (window.customElements.get(tagName)) return

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

  const templateContent = el.content.firstElementChild

  window.customElements.define(
    tagName,
    class extends HTMLElement {
      constructor() {
        super()
        this._slotFills = null
      }
      connectedCallback() {
        let slotFills
        if (this._slotFills) {
          slotFills = this._slotFills
        } else {
          slotFills = collectSlotFills(this)
          this._slotFills = slotFills
        }
        const newEl = templateContent.cloneNode(true)
        this._x_slots = Object.fromEntries(
          [...slotFills.entries()].map(([name, value]) => [name, value])
        )

        // if (!this.id) {
        // this.setAttribute('x-bind:id', Alpine.evaluate(this, `$id('${tagName}')`))
        // }

        const targetSlots = findTargetSlots(newEl)

        for (const targetSlot of targetSlots) {
          const slotName = targetSlot.name || 'default'
          const fills = slotFills.get(slotName)
          if (fills) {
            targetSlot.replaceWith(...fills.map((n) => n.cloneNode(true)))
          } else {
            // shouldn't use cloned children since that might orphan nested slots
            targetSlot.replaceWith(...[...targetSlot.childNodes])
          }
        }

        requestAnimationFrame(() => this.replaceChildren(newEl))

        this.dispatchEvent(
          new CustomEvent('x-widget:connected', {
            bubbles: true
          })
        )
      }
    }
  )
}

function findTargetSlots(el) {
  let slots = [...el.querySelectorAll('slot')]
  if (el.tagName === 'SLOT') slots.unshift(el)

  const templates = el.querySelectorAll('template')
  for (const template of templates) {
    if (template.getAttribute('x-widget')) continue
    for (const child of template.content.children) {
      slots.push(...findTargetSlots(child))
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
