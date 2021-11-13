export default function (Alpine) {
  const findInParent = (prop) => (el) => {
    while (el && !el[prop]) el = el.parentElement;
    return el?.[prop];
  };
  Alpine.magic("attrs", findInParent("_x_attrs"));
  Alpine.magic("props", findInParent("_x_props"));
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

  window.customElements.define(
    name,
    class extends HTMLElement {
      disconnectedCallback() {
        Alpine.release(this._x_attrs);
        Alpine.release(this._x_props);
      }

      connectedCallback() {
        const attribs = (this._x_attrs = Alpine.reactive({}));
        const props = (this._x_props = Alpine.reactive({}));

        const newEl = el.content.firstElementChild.cloneNode(true);

        const slotFills = collectSlotFills(this);
        this._x_slots = Object.fromEntries(
          [...slotFills.entries()].map(([name]) => [name, true])
        );

        const targetSlots = findSlots(newEl);

        for (const targetSlot of targetSlots) {
          const slotName = targetSlot.name || "default";
          const fills = slotFills.get(slotName);

          const replacements = fills
            ? slotFills.get(slotName)
            : [...targetSlot.childNodes];

          targetSlot.replaceWith(...replacements);
        }

        while (this.firstChild) this.removeChild(this.firstChild);

        for (const attrib of this.attributes) {
          if (attrib.name.match(/^(:|x-bind:|x-prop:)/)) {
            const [attrKind, name] = attrib.name.split(":");

            const attribEval = Alpine.evaluateLater(this, attrib.value);

            Alpine.effect(() =>
              attribEval((value) => {
                attrKind === "x-prop"
                  ? (props[name] = value)
                  : (attribs[name] = value);
              })
            );
          }

          if (!attrib.name.match(/^(@|x-|:)/))
            attribs[attrib.name] = attrib.value;
        }

        setTimeout(() => {
          this.innerHTML = newEl.outerHTML;
        }, 0);
      }
    }
  );
}

function findSlots(el) {
  if (el.tagName === "SLOT") return [el];

  let slots = [...el.querySelectorAll("slot")];
  const templates = el.querySelectorAll("template");
  for (const template of templates) {
    if (template.getAttribute("x-component")) continue;
    for (const child of template.content.children) {
      slots.push(...findSlots(child));
    }
  }
  return slots;
}

function collectSlotFills(el) {
  const slots = new Map();

  for (const child of el.children) {
    if (child.tagName !== "TEMPLATE") continue;

    const rawSlotName = child.getAttribute("slot");
    const slotName = rawSlotName || "default";
    if (!slots.has(slotName)) slots.set(slotName, []);

    const isSlotFill =
      !rawSlotName &&
      (child.getAttribute("x-for") || child.getAttribute("x-if"));

    slots
      .get(slotName)
      .push(...(isSlotFill ? [child] : child.content.childNodes));
  }

  return slots;
}
