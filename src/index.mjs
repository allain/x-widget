import { xWidgetData } from './x-widget-data.mjs'
import { xPropDirective } from './x-prop-directive.mjs'
import { xWidgetDirective, slotsMagic } from './x-widget.mjs'

export default function (Alpine) {
  Alpine.magic('slots', slotsMagic)
  Alpine.directive('widget', xWidgetDirective)
  Alpine.directive('prop', xPropDirective)
  Alpine.data('xWidget', xWidgetData.bind(Alpine))
}

export { xWidgetData, xWidgetDirective, xPropDirective, slotsMagic }
