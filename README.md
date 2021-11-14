# x-comp

Adds the ability to define web components using Alpinejs.

## Basic Usage

```html
<!-- Define the Component using the x-component directive -->
<template x-component="x-button">
<button><slot><span x-text="label"></span></button>
</template>

<!-- Use the component -->
<x-button x-data="{label: 'Click me!'}"></x-button>
<x-button x-data="{label: 'Click me!'}"></x-button>
```

## Features

### Slots

```html
<template x-component="x-panel">
  <div>
    <template x-if="$slots.header">
      <div class="header">
        <slot name="header"></slot>
      </div>
    </template>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<x-panel>
  <template slot="header">
    <h1>Panel Header</h1>
  </template>
  <!-- Default Slot -->
  <template>
    <p>Panel Content</p>
  </template>
</x-panel>
```

### Optional Data Controller

The data controller is an optional feature that allows you to define the properties, their data types, and the defaults your component expects.

It supports giving values for properties using attributes, as well as a new `x-prop` mechanism.

Normally when you bind an attribute to an element it must serialize it to a string. `x-prop:` allows you to bypass this and provide the value directly.

In addition, `x-prop` provide two way binding. In the example below, that means clicking on "close" will set showDropdown to false.

```html
<template x-component="x-dropdown">
  <div
    x-data="xController({
      open: false, // define show as a boolean with default value of false
      items: [], // define items as an array with default value of []
    })($el, $data)"
  >
    <div x-show="open">
      <button @click="open = false">Close</button>
      <template x-for="item of items">
        <option :value="item.value" x-text="item.label"></option>
      </template>
    </div>
  </div>
</template>

<div x-data="{showDropdown: true}">
  <x-dropdown
    x-prop:open="showDropdown"
    x-prop:items="[{value: 1, label: 'One'}, {value: 2, label: 'Two'}]"
  ></x-dropdown>
</div>
```

If you don't like the look of having the controller's spec in the DOM, you can do this:

```html
<script>
  import { xControllerData } from 'x-component'

  Alpine.data(
    'xDropdown',
    xControllerData({
      open: false, // define show as a boolean with default value of false
      items: [] // define items as an array with default value of []
    })
  )
</script>

<template x-component="x-dropdown">
  <div x-data="xDropdown($el, $data)">
    <div x-show="open">
      <button @click="open = false"></button>
      <template x-for="item of items">
        <option :value="item.value" x-text="item.label"></option>
      </template>
    </div>
  </div>
</template>
```
