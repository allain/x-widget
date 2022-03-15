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
  { cleanup }
) {
  const propName = snakeToCamel(attribName)
  const read = lazyEvaluator(el.parentElement, expression)

  // allow assignment of unsafe left hand side by just using the new value without bubbling up
  let unsafeValue
  const setter = safeLeftHandSide(el, expression)
    ? lazyEvaluator(el.parentElement, `${expression} = __`)
    : (_, { scope: { __: newValue } }) => (unsafeValue = newValue)

  const propObj = {}

  Object.defineProperty(propObj, propName, {
    get() {
      let result
      if (typeof unsafeValue !== 'undefined') {
        return unsafeValue
      }
      read((newValue) => (result = newValue))
      return result
    },
    set(newValue) {
      if (propName !== 'value') {
        el[propName] = newValue
      }
      setter(() => {}, { scope: { __: newValue } })
    }
  })

  if (propName !== 'value') {
    el[propName] = propObj[propName]
  }

  const removeScope = addScopeToNode(el, propObj)

  cleanup(() => removeScope())
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
