function createInput(onChange) {
  const input = document.createElement('input');
  input.setAttribute('type', 'range');
  input.setAttribute('max', '255');
  input.setAttribute('min', '0');
  input.setAttribute('value', '255');
  input.classList.add('slider');
  input.addEventListener('mousemove', () => {
    onChange(input.value);
  });
  input.addEventListener('change', () => {
    onChange(input.value);
  });
  return input;
}

export default class ColorEditor {
  constructor(container, onSetColor) {
    this.color = { r: 1, g: 1, b: 1, a: 1 };
    this.onSetColor = onSetColor;
    this.container = container;
    this.initDomElement();
  }

  initDomElement() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('color-editor');
    this.indicator = document.createElement('div');
    this.indicator.classList.add('color-editor__indicator');
    this.inputs = {
      r: createInput((value) => this.setColorAttribute('r', value / 255)),
      g: createInput((value) => this.setColorAttribute('g', value / 255)),
      b: createInput((value) => this.setColorAttribute('b', value / 255)),
      a: createInput((value) => this.setColorAttribute('b', value)),
    };
    this.wrapper.appendChild(this.indicator);
    this.wrapper.appendChild(this.inputs.r);
    this.wrapper.appendChild(this.inputs.g);
    this.wrapper.appendChild(this.inputs.b);
    this.container.appendChild(this.wrapper);
  }

  setColorAttribute(attr, value) {
    this.color[attr] = value;
    this.setColor(this.color);
    this.onSetColor(this.color);
  }

  setColor(color) {
    this.color = color;
    this.indicator.setAttribute('style', `background-color: rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.a})`);
    Object.keys(this.inputs).forEach(key => {
      this.inputs[key].value = this.color[key] * 255;
    });
  }
}
