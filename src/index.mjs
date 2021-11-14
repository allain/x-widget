import { xComponentData } from './x-component-data.mjs'

import {
  xComponentDirective,
  xPropDirective,
  slotsMagic
} from './x-component.mjs'

export default function (Alpine) {
  Alpine.magic('slots', slotsMagic)
  Alpine.directive('component', xComponentDirective)
  Alpine.directive('prop', xPropDirective)
  Alpine.data('xComponent', xComponentData.bind(Alpine))
}

export { xComponentData, xComponentDirective, xPropDirective, slotsMagic }
