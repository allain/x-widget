const camelToSnake = (name) =>
  name.replace(/[a-z][A-Z]/g, (m) => m[0] + '-' + m[1].toLowerCase())

export function xWidgetData(spec) {
  const Alpine = this
  const propDescriptorEntries = Object.entries(
    Object.getOwnPropertyDescriptors(spec)
  )

  return ($el, $data) => {
    const widgetEl = findWidget($el)
    console.assert(widgetEl, 'widget not found')

    const boundProps = Array.from(widgetEl.attributes)
      .filter((attr) => attr.name.startsWith('x-prop:'))
      .map(({ name }) => name.substr(7))

    const observer = new MutationObserver((changes) => {
      changes.forEach(({ attributeName, target }) => {
        setProp(attributeName, target.getAttribute(attributeName))
      })
    })

    observer.observe(widgetEl, {
      attributes: true,
      attributeFilter: Object.keys(spec).map(camelToSnake),
      attributeOldValue: false
    })

    const proplessDescriptors = Object.fromEntries(
      propDescriptorEntries.filter(([name]) => !boundProps.includes(name))
    )

    const data = Alpine.reactive(
      Object.assign(
        Object.create(Object.getPrototypeOf(spec), proplessDescriptors),
        {
          destroy() {
            observer.disconnect()
          }
        }
      )
    )

    const attribs = [...widgetEl.attributes]
    for (const name of Object.getOwnPropertyNames(spec)) {
      const attrib = attribs.find((attr) =>
        attr.name.match(
          new RegExp(`^((x-(bind|prop))?:)?${camelToSnake(name)}$`)
        )
      )
      if (!attrib) continue

      // is bound using prop defer to internals of x-prop
      if (attrib.name.startsWith('x-prop:')) {
        Object.defineProperty(data, name, {
          configurable: true, // so it can be deleted,
          enumerable: true, // so it appears on inspection
          get() {
            return $data[name]
          },
          set(newValue) {
            $data[name] = newValue
          }
        })
      } else {
        setProp(name, widgetEl.getAttribute(camelToSnake(name)))
      }
    }

    // validate attribValue to conform to spec
    function setProp(name, attribValue) {
      const defaultValue = spec[name]
      if (typeof defaultValue === 'boolean') {
        if (attribValue === '') {
          data[name] = true
        } else if (attribValue === 'false') {
          data[name] = false
        } else {
          data[name] = !!attribValue
        }
      } else if (typeof defaultValue === 'number') {
        data[name] = parseFloat(attribValue)
      } else if (typeof defaultValue === 'string') {
        data[name] = attribValue
      } else {
        throw new Error('unsupported static attribute: ' + name)
      }
    }

    return data
  }
}

function findWidget(el) {
  while (el && !el.tagName.includes('-')) el = el.parentElement
  return el
}
