import {
  addScopeToNode,
  closestDataStack,
  mergeProxies
} from 'alpinejs/src/scope.js'

import { lazyEvaluator } from './lazy-evaluator.mjs'

const snakeToCamel = (name) =>
  name.replace(/-([a-zA-Z])/g, (m) => m[1].toUpperCase() + m.substr(2))

export function xPropDirective(
  el,
  { value: attribName, expression },
  { Alpine, cleanup, effect }
) {
  const propName = snakeToCamel(attribName)
  const propObj = Alpine.reactive({ [propName]: null })

  const read = lazyEvaluator(el.parentElement, expression)

  let setValue

  effect(() => {
    read((propValue) => {
      propObj[propName] = propValue
      if (propName !== 'value') {
        el[propName] = propValue
      }
      setValue = undefined
    })
  })

  let removeScope
  if (safeLeftHandSide(el, expression)) {
    const setter = lazyEvaluator(el.parentElement, `${expression} = __`)

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
