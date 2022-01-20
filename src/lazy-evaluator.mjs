import { closestDataStack, mergeProxies } from 'alpinejs/src/scope.js'
import { tryCatch, handleError } from 'alpinejs/src/utils/error.js'

// Taken from https://github.com/alpinejs/alpine/blob/main/packages/alpinejs/src/evaluator.js and stripped down
// this performs the same as alpine's normal evaluator, except that when it receives a function as a result it doesn't invoke it
export function lazyEvaluator(el, expression) {
  let dataStack = closestDataStack(el)

  let evaluator = generateEvaluatorFromString(dataStack, expression, el)

  return tryCatch.bind(null, el, expression, evaluator)
}

function generateEvaluatorFromString(dataStack, expression, el) {
  let func = generateFunctionFromString(expression, el)

  return (receiver = () => {}, { scope = {} /*params = []*/ } = {}) => {
    func.result = undefined
    func.finished = false

    let completeScope = mergeProxies([scope, ...dataStack])

    if (typeof func === 'function') {
      let promise = func(func, completeScope).catch((error) =>
        handleError(error, el, expression)
      )

      // Check if the function ran synchronously,
      if (func.finished) {
        receiver(bindResult(func.result, completeScope))
        func.result = undefined
      } else {
        // If not, return the result when the promise resolves.
        promise
          .then((result) => bindResult(result, completeScope))
          .catch((error) => handleError(error, el, expression))
          .finally(() => (func.result = undefined))
      }
    }
  }
}

function bindResult(result, scope) {
  return typeof result === 'function' ? result.bind(scope) : result
}

let evaluatorMemo = {}

function generateFunctionFromString(expression, el) {
  if (evaluatorMemo[expression]) {
    return evaluatorMemo[expression]
  }

  let AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

  // Some expressions that are useful in Alpine are not valid as the right side of an expression.
  // Here we'll detect if the expression isn't valid for an assignement and wrap it in a self-
  // calling function so that we don't throw an error AND a "return" statement can b e used.
  let rightSideSafeExpression =
    0 ||
    // Support expressions starting with "if" statements like: "if (...) doSomething()"
    /^[\n\s]*if.*\(.*\)/.test(expression) ||
    // Support expressions starting with "let/const" like: "let foo = 'bar'"
    /^(let|const)\s/.test(expression)
      ? `(() => { ${expression} })()`
      : expression

  const safeAsyncFunction = () => {
    try {
      return new AsyncFunction(
        ['__self', 'scope'],
        `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`
      )
    } catch (error) {
      handleError(error, el, expression)
      return Promise.resolve()
    }
  }
  let func = safeAsyncFunction()

  evaluatorMemo[expression] = func

  return func
}
