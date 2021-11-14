import { expect } from '@esm-bundle/chai/esm/chai.js'
import plugin from '../src/index.mjs'
import { xComponentData } from '../src/x-component-data.mjs'
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

  Alpine.data('xComponent', xComponentData.bind(Alpine))
  Alpine.start()
})

beforeEach(() => (document.body.innerHTML = ''))

const tplHtml = `<template x-component="x-c">
        <div class="inner" x-data="xComponent({show: true})($el, $data)">
          <template x-if="show"><div>SHOW</div></template>
          <div class="t" x-text="JSON.stringify(show)"></div>
        </div>
      </template>`

it('uses default if not given', async () => {
  document.body.innerHTML = html`
    ${tplHtml}
    <x-c></x-c>
  `
  const c = await waitForEl('x-c')
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
