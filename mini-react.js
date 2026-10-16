function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(text),
    },
    children: [],
  };
}

function createElement(type, props, ...children) {
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

