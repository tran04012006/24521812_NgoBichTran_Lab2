export function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(text),
    },
    children: [],
  };
}

export function createElement(type, props, ...children) {
  return {
    type: type,
    props: props || {},
    children: children.map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return createTextElement(child);
      }

      return child;
    }),
  };
}

export function renderToDOM(vnode) {
  // tao Dom node
  if (vnode.type === "TEXT_ELEMENT") {
    return document.createTextNode(vnode.props.nodeValue);
  }

  const dom = document.createElement(vnode.type);

  //xu li props
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === "onClick" && typeof value === "function") {
      dom.addEventListener("click", value);
    } else if (key === "className") {
      dom.className = value;
    } else if (key === "id" || key === "role") {
      dom.setAttribute(key, value);
    }
  });

  // children
  vnode.children.forEach((child) => {
    const childDOM = renderToDOM(child);
    dom.appendChild(childDOM);
  });

  return dom;
}
