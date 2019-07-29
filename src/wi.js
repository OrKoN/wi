/*
  names:
    - p:props
    - t:type
    - c:child
    - k:key

 -- support svg
 -- tests
*/

export function h(t, p, children) {
  p = { ...p };
  if (children != null && !Array.isArray(children)) {
    children = [children];
    for (var i = 3; i < arguments.length; i++) {
      children.push(arguments[i]);
    }
  }
  if (children != null) {
    p.children = children.map((c, i) =>
      typeof c === 'object'
        ? c
        : {
            t: null,
            p: c,
            k: null,
          },
    );
  }
  var k = p && p.k ? p.k : null;
  delete p.k;
  return {
    t,
    k,
    p,
    constructor: undefined,
  };
}

export function renderApp(node, mount, state, wireActions) {
  var store = {
    state,
    flush: () => {
      _enumerate(elements, (elementKey) => {
        elements[elementKey].used = false;
      });
      render(node, mount);
      _enumerate(elements, (elementKey) => {
        if (!elements[elementKey].used) {
          // unmount
          var node = elements[elementKey];
          _invoke(node.p, willUnmount, node.el);
          node.el.parentNode.removeChild(node.el);
          delete elements[elementKey];
        }
      });
    },
  };

  var elements = {};

  function getEl(key, node) {
    if (!(key in elements)) {
      elements[key] = {
        el:
          node.t === null
            ? document.createTextNode(node.p)
            : document.createElement(node.t),
      };
    }
    elements[key].used = true;
    return elements[key].el;
  }

  var actions = wireActions(store);

  _enumerate(actions, (actionKey) => {
    var action = actions[actionKey];
    actions[actionKey] = (...args) => {
      if (action.call(actions, ...args) !== false) {
        store.flush();
      }
    };
  });

  function setProperty(el, name, value, oldValue) {
    if (name in reservedProps) {
      return;
    }
    name = name === 'className' ? 'class' : name;
    if (name === 'dangerouslySetInnerHTML') {
      if (oldValue && value.__html === oldValue.__html) {
        return;
      }
      el.innerHTML = value === null ? '' : value.__html;
    }
    if (name.startsWith('on')) {
      el[name.toLowerCase()] = value;
    } else {
      if (value === null || value === false) {
        el.removeAttribute(name, value);
      } else {
        el.setAttribute(name, value);
      }
    }
  }

  function update(el, newProps, oldProps) {
    _enumerate(oldProps, (prop) => {
      if (!(prop in newProps)) {
        setProperty(el, prop, null, oldProps[prop]);
      }
    });

    _enumerate(newProps, (prop) => {
      if (oldProps[prop] !== newProps[prop]) {
        setProperty(el, prop, newProps[prop], oldProps[prop]);
      }
    });
  }

  function render(node, target, prefix = [], idx = 0) {
    if (node.t instanceof Function) {
      return render(
        node.t({
          ...node.p,
          state: store.state,
          actions,
        }),
        target,
        prefix,
      );
    }

    prefix.push(node.t || 'text', node.k || idx);

    var key = prefix.join('.');
    var exists = !!elements[key];
    var el = getEl(key, node);
    var order = [];

    if (el instanceof HTMLElement) {
      var oldp = exists ? elements[key].p : {};
      update(el, node.p, oldp);
      var i = 0;
      for (var c of node.p[children]) {
        order.push(render(c, el, prefix, i));
        i++;
      }
      elements[key].p = { ...node.p };
    } else if (el instanceof Text) {
      el.nodeValue = node.p;
    }

    prefix.splice(-2, 2);

    // reorder
    for (var i = 0; i < order.length; i++) {
      if (el.children[i] !== order[i]) {
        el.insertBefore(order[i], el.children[i]);
      }
    }

    if (!exists) {
      // mount
      target.appendChild(el);
    }

    _invoke(node.p, exists ? didUpdate : didMount, el);

    return el;
  }

  render(node, mount);
}

function _enumerate(obj, cb) {
  Object.keys(obj).forEach((key) => {
    cb(key);
  });
}

function _invoke(obj, fn, ...args) {
  obj && obj[fn] && obj[fn](...args);
}

var didUpdate = 'didUpdate';
var didMount = 'didMount';
var willUnmount = 'willUnmount';
var className = 'className';
var children = 'children';

var reservedProps = {
  actions: 0,
  state: 0,
  k: 0,
  [children]: 0,
  [willUnmount]: 0,
  [didUpdate]: 0,
  [didMount]: 0,
};
