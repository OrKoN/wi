/*
 -- remove props
 -- support class names
 -- support svg
 -- tests
 -- dangerously set html
*/

export function h(type, props, ...children) {
  let nodeChildren = [];

  for (var c of children) {
    if (typeof c === 'string' || typeof c === 'number') {
      nodeChildren.push({
        type: null,
        props: c,
      });
    } else {
      nodeChildren.push(c);
    }
  }

  return {
    type,
    props: {
      ...props,
      children: nodeChildren,
    },
  };
}

function _iterate(obj, cb) {
  Object.keys(obj).forEach((key) => {
    cb(key);
  });
}

export function renderApp(node, mount, state, wireActions) {
  const store = {
    state,
  };

  const elements = {};

  function getEl(key, type, props) {
    if (key in elements) {
      elements[key].used = true;
      elements[key].props = props;
      return elements[key];
    }
    elements[key] = {
      el:
        type === null
          ? document.createTextNode(props)
          : document.createElement(type),
      used: true,
      props,
    };
    return elements[key];
  }

  const specialProps = {
    children: 0,
    className: 0,
  };

  const actions = wireActions(store);

  _iterate(actions, (actionKey) => {
    const action = actions[actionKey];
    actions[actionKey] = (...args) => {
      const act = !!action(...args);
      if (act) {
        _iterate(elements, (elementKey) => {
          elements[elementKey].used = false;
        });
        render(node, mount);
        _iterate(elements, (elementKey) => {
          if (!elements[elementKey].used) {
            const node = elements[elementKey];

            node.el.parentNode.removeChild(node.el);

            if (node.props && typeof node.props.willUnmount === 'function') {
              node.props.willUnmount(node.el);
            }
            delete elements[elementKey];
          }
        });
      }
    };
  });

  function render(node, target, prefix = [], idx = 0) {
    if (node.type instanceof Function) {
      return render(
        node.type({
          ...node.props,
          state: store.state,
          actions,
        }),
        target,
        prefix,
        idx,
      );
    }

    const key = [...prefix, node.type, idx].join('.');
    const exists = !!elements[key];
    const { el, props } = getEl(key, node.type, node.props);

    if (el instanceof HTMLElement) {
      for (var opt of Object.keys(node.props || {})) {
        if (!(opt in specialProps)) {
          el[opt.toLowerCase()] = node.props[opt];
        }
      }

      prefix.push(node.type);
      prefix.push(idx);

      if (node.props && node.props.children) {
        for (var i = 0; i < node.props.children.length; i++) {
          render(node.props.children[i], el, prefix, i);
        }
      }
    } else if (el instanceof Text) {
      el.nodeValue = node.props;
    }

    if (exists && props && typeof props.didUpdate === 'function') {
      props.didUpdate(el);
    }

    prefix.pop();
    prefix.pop();

    if (!exists) {
      target.appendChild(el);
      if (props && typeof props.didMount === 'function') {
        props.didMount(el);
      }
    }

    return el;
  }

  render(node, mount);
}
