export function Later(maxBlockTime = 250) {
  let queue = Promise.resolve()
  let blockStart = null
  return function later(fn) {
    queue = queue.then(() => {
      fn()
      if (blockStart === null) {
        blockStart = Date.now()
      } else if (Date.now() - blockStart > maxBlockTime) {
        return new Promise((r) =>
          setTimeout(() => {
            blockStart = null
            r()
          }, 0)
        )
      }
    })
  }
}
