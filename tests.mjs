import { expect } from '@esm-bundle/chai/esm/chai.js'
import xComponent from './x-component.mjs'
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

before(() => {
  document.body.setAttribute('x-data', '')
  Alpine.plugin(xComponent)

  window.Alpine = Alpine
  Alpine.start()
})

beforeEach(() => {
  document.body.innerHTML = ''
})

it('works in basic case', async () => {
  document.body.innerHTML = `
	<template x-component="x-test1">
	   <div class="inner">Hello World</div>
	</template>

	<x-test1></x-test1>
  `

  const innerEl = await waitUntil(() => document.querySelector('.inner'))
  expect(innerEl.parentElement.tagName).to.equal('X-TEST1')
})
