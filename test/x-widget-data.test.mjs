import { expect } from '@esm-bundle/chai/esm/chai.js'
import plugin from '../src/index.mjs'
import { xWidgetData } from '../src/x-widget-data.mjs'
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
  Alpine.plugin(plugin)

  Alpine.data('xWidget', xWidgetData.bind(Alpine))
  Alpine.start()
})

beforeEach(() => (document.body.innerHTML = ''))

const tplHtml = `<template x-widget="x-c">
        <div class="inner" x-data="xWidget({show: true, firstName: 'Default'})($el, $data)">
          <template x-if="show"><div>SHOW</div></template>
          <div class="t" x-text="JSON.stringify(show)"></div>
          <span x-text="firstName"></span>
        </div>
      </template>`

it('uses default if not given', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <x-c></x-c>
  `
  const c = await waitForEl('x-c')
  await new Promise((resolve) => setTimeout(resolve, 1))
  expect(c.innerText).to.contain('SHOW')
})

it('supports passing "false"to bool', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <x-c show="false"></x-c>
  `
  const c = await waitForEl('x-c')
  expect(c.innerText).not.to.contain('SHOW')
})

it('supports using attribute as boolean', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <x-c show></x-c>
  `
  const c = await waitForEl('x-c')

  expect(c.innerText).to.contain('SHOW')
})

it('supports binding a prop with a scalar value', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <x-c x-prop:show="true"></x-c>
  `
  const c = await waitForEl('x-c')

  expect(c.innerText).to.contain('SHOW')
})

it.skip('supports refs when lhs is complex', async () => {
  document.body.innerHTML = html`
  <div x-data="{y: 'test', names: {test: 'Al'}}"
    ${tplHtml}
    <x-c x-prop:show="names[y]"></x-c>
  </div>
  `
  const c = await waitForEl('x-c')

  expect(c.innerText).to.contain('SHOW')
})

it('supports binding a prop with an expression from parent scope', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <div id="root" x-data="{rootShow: true}">
      <x-c x-prop:show="rootShow"></x-c>
    </div>
  `
  const rootEl = await waitForEl('#root')

  const c = await waitForEl('x-c')
  expect(c.innerText).to.contain('SHOW')

  Alpine.evaluate(rootEl, 'rootShow= false')
  await new Promise((r) => setTimeout(r, 0))
  expect(c.innerText).not.to.contain('SHOW')

  const cTest = await waitForEl('x-c .t')

  // test reverse direction. x-props two way bind
  Alpine.evaluate(cTest, 'show = true')
  await new Promise((r) => setTimeout(r, 1))
  expect(Alpine.evaluate(rootEl, 'rootShow')).to.be.true
})

it('supports binding an attribute with a scalar value', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <div id="root" x-data="{rootShow: true}">
      <x-c id="a" x-bind:show="true"></x-c>
      <x-c id="b" x-bind:show="false"></x-c>
    </div>
  `
  const cA = await waitForEl('#a')
  expect(cA.innerText).to.contain('SHOW')

  const cB = await waitForEl('#b')
  expect(cB.innerText).not.to.contain('SHOW')
})

it('supports binding attribute value with an expression from parent scope', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <div id="root" x-data="{rootShow: true}">
      <x-c x-bind:show="rootShow ? 'true': 'false'"></x-c>
    </div>
  `
  const rootEl = await waitForEl('#root')

  const c = await waitForEl('x-c')
  expect(c.innerText).to.contain('SHOW')

  Alpine.evaluate(rootEl, 'rootShow=false')
  await new Promise((r) => setTimeout(r, 0))

  expect(c.innerText).not.to.contain('SHOW')

  const c7Test = await waitForEl('x-c .t')

  // test reverse direction attribute bindings don't two way bind
  Alpine.evaluate(c7Test, 'show = true')
  await new Promise((r) => setTimeout(r, 1))
  expect(Alpine.evaluate(rootEl, 'rootShow')).to.be.false
})

it('supports methods on data', async () => {
  document.body.innerHTML = html`
    <template x-widget="x-action">
      <div
        x-data="xWidget({
        show: false,
        toggle() {
          this.show = !this.show
        }
      })($el, $data)"
      >
        <button @click="toggle">Toggle</button>
        <div x-text="show ? 'SHOW':''"></div>
      </div>
    </template>

    <x-action></x-action>
  `

  const xAction = await waitForEl('x-action')
  expect(xAction.innerText).not.to.contain('SHOW')

  const button = await waitForEl('button')
  button.click()

  await new Promise((r) => setTimeout(r, 1))
  expect(xAction.innerText).to.contain('SHOW')
})

it('supports getters and setters', async () => {
  document.body.innerHTML = html`
    <template x-widget="x-getset">
      <div
        id="inner"
        x-data="xWidget({
          tests: [],
          get tested() {
            return this.tests.length > 0
          },
          set tested(newValue) {
            if (newValue === false) {
              this.tested = []
            }
          },
          test() {
            this.tests = [...this.tests, Date.now()]
          }
        })($el, $data)"
      >
        <button @click="tested=false">Untest</button>
        <button @click="test">Test</button>
        <div x-text="tested ? 'Tested':'Untested'"></div>
      </div>
    </template>

    <x-getset></x-getset>
  `

  const xGetSet = await waitForEl('x-getset')
  const xGetSetInner = await waitForEl('x-getset #inner')

  await new Promise((r) => setTimeout(r, 1))
  expect(xGetSet.innerText).to.contain('Untested')

  Alpine.evaluate(xGetSetInner, 'test()')
  await new Promise((r) => setTimeout(r, 100))

  expect(xGetSet.innerText).to.contain('Tested')
})

it('supports binding a camelcase prop', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <div id="root" x-data="{rootShow: false, firstName: 'John'}">
      <x-c x-prop:show="rootShow" x-prop:first-name="firstName"></x-c>
    </div>
  `
  const c = await waitForEl('x-c')

  expect(c.innerText).to.contain('John')
})
