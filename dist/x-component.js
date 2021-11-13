(() => {
  // node_modules/alpinejs/src/scope.js
  function addScopeToNode(node, data, referenceNode) {
    node._x_dataStack = [data, ...closestDataStack(referenceNode || node)];
    return () => {
      node._x_dataStack = node._x_dataStack.filter((i) => i !== data);
    };
  }
  function closestDataStack(node) {
    if (node._x_dataStack)
      return node._x_dataStack;
    if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
      return closestDataStack(node.host);
    }
    if (!node.parentNode) {
      return [];
    }
    return closestDataStack(node.parentNode);
  }

  // src/x-component.mjs
  function x_component_default(Alpine) {
    const findInParent = (prop) => (el) => {
      while (el && !el[prop])
        el = el.parentElement;
      return el?.[prop];
    };
    Alpine.magic("slots", findInParent("_x_slots"));
    Alpine.directive("component", xComponentDirective);
  }
  function xComponentDirective(el, { expression, modifiers }, { Alpine }) {
    const name = expression;
    if (modifiers[0]) {
      const style = document.createElement("style");
      style.innerHTML = `${name} { display: ${modifiers[0]}}`;
      document.head.appendChild(style);
    }
    window.customElements.define(name, class extends HTMLElement {
      disconnectedCallback() {
        this._x_attrs_cleanup();
        delete this._x_attrs_cleanup;
      }
      connectedCallback() {
        const attribs = Alpine.reactive({});
        const newEl = el.content.firstElementChild.cloneNode(true);
        const slotFills = collectSlotFills(this);
        this._x_slots = Object.fromEntries([...slotFills.entries()].map(([name2]) => [name2, true]));
        const targetSlots = findSlots(newEl);
        for (const targetSlot of targetSlots) {
          const slotName = targetSlot.name || "default";
          const fills = slotFills.get(slotName);
          const replacements = fills ? slotFills.get(slotName) : [...targetSlot.childNodes];
          targetSlot.replaceWith(...replacements);
        }
        setTimeout(() => {
          this._x_attrs_cleanup = addScopeToNode(this, attribs);
          for (const attrib of this.attributes) {
            if (attrib.name.match(/^(:|x-bind:)/)) {
              const [, name2] = attrib.name.split(":");
              const attribEval = Alpine.evaluateLater(this, attrib.value);
              Alpine.effect(() => attribEval((value) => attribs[name2] = value));
            } else if (!attrib.name.match(/^(@|x-)/) && !this.hasAttribute(":" + attrib.name) && !this.hasAttribute("x-bind:" + attrib.name)) {
              attribs[attrib.name] = attrib.value;
            }
          }
          this.replaceChildren(newEl);
        }, 0);
      }
    });
  }
  function findSlots(el) {
    if (el.tagName === "SLOT")
      return [el];
    let slots = [...el.querySelectorAll("slot")];
    const templates = el.querySelectorAll("template");
    for (const template of templates) {
      if (template.getAttribute("x-component"))
        continue;
      for (const child of template.content.children) {
        slots.push(...findSlots(child));
      }
    }
    return slots;
  }
  function collectSlotFills(el) {
    const slots = new Map();
    for (const child of el.children) {
      if (child.tagName !== "TEMPLATE")
        continue;
      const rawSlotName = child.getAttribute("slot");
      const slotName = rawSlotName || "default";
      if (!slots.has(slotName))
        slots.set(slotName, []);
      const isSlotFill = !rawSlotName && (child.getAttribute("x-for") || child.getAttribute("x-if"));
      slots.get(slotName).push(...isSlotFill ? [child] : child.content.childNodes);
    }
    return slots;
  }
})();
