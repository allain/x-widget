import { expect } from '@esm-bundle/chai/esm/chai.js'
import { xPropDirective } from '../src/index.mjs'
import Alpine from 'alpinejs'

const waitUntil = (predicate, timeout = 10000) =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('timeout')), timeout)
    const waitId = setInterval(() => {
      const result = predicate()

      if (result) {
        clearInterval(waitId)
        resolve(result)
      }
    }, 1)
  })

const waitForEl = (selector) =>
  waitUntil(() => document.querySelector(selector))

// so html gets formatted in literals in vscode
const html = String.raw

before(() => {
  document.body.setAttribute('x-data', '')
  Alpine.directive('prop', xPropDirective)
  window.Alpine = Alpine
  Alpine.start()
})

beforeEach(() => (document.body.innerHTML = ''))

it('works in basic case', async () => {
  document.body.innerHTML = `
  <div id="root" x-data="{x: 10}">
    <div x-prop:y="x">
       <span x-text="y"></span>
       </div>
    </div>
  `

  const spanEl = await waitForEl('span')

  expect(spanEl.innerText).to.equal('10')

  Alpine.evaluate(spanEl, 'y = 20')

  await new Promise((r) => setTimeout(r, 0))

  const rootEl = await waitForEl('#root')
  expect(Alpine.evaluate(rootEl, 'x')).to.equal(20)
})

it('sees props in scope', async () => {
  document.body.innerHTML = `
  <div id="root" x-data="{x: 10}">
    <div x-prop:y="x">
       <span x-text="JSON.stringify({x,y})"></span>
       </div>
    </div>
  `

  const spanEl = await waitForEl('span')

  expect(spanEl.innerText).to.equal('{"x":10,"y":10}')
})

it('cleans up if last prop removed', async () => {
  document.body.innerHTML = html`
    <div id="root" x-prop:x="10" x-prop:y="20"></div>
  `

  const spanEl = await waitForEl('#root')

  expect(spanEl._x_props).not.to.be.undefined
  spanEl.removeAttribute('x-prop:x')
  await new Promise((r) => setTimeout(r, 0))
  expect(spanEl._x_props).not.to.be.undefined
  spanEl.removeAttribute('x-prop:y')
  await new Promise((r) => setTimeout(r, 0))

  expect(spanEl._x_props).to.be.undefined
})

it('supports deep refs', async () => {
  document.body.innerHTML = html`
    <div id="root" x-data="{a: {b: 10}}">
      <div class="inner" x-prop:x="a.b"></div>
    </div>
  `

  const rootEl = await waitForEl('#root')
  const innerEl = await waitForEl('.inner')

  await new Promise((r) => setTimeout(r, 0))
  Alpine.evaluate(innerEl, 'x = 20')
  await new Promise((r) => setTimeout(r, 0))

  expect(Alpine.evaluate(rootEl, 'a.b')).to.equal(20)
})

it('works with non left hand side expressions', async () => {
  document.body.innerHTML = html`
    <div id="root" x-prop:x="10" x-prop:y="20" x-text="x + y"></div>
  `

  const spanEl = await waitForEl('#root')

  expect(spanEl.innerText).to.equal('30')
})

it('assigning to non left hand side expressions is no-op', async () => {
  document.body.innerHTML = html` <div id="root" x-prop:x="10"></div> `

  const spanEl = await waitForEl('#root')
  Alpine.evaluate(spanEl, 'x = 20')
  expect(Alpine.evaluate(spanEl, 'x')).to.equal(10)
})
