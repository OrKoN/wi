/*
  names:
    - p:props
    - t:type
    - c:child
    - k:key

 -- support svg
 -- tests
*/

export function h(t, p, ...children) {
  p = { ...p };
  let k = p && p.k ? p.k : null;
  delete p.k;
  if (arguments.length >= 3) {
    p.children =
      children.length == 1 && Array.isArray(children[0])
        ? children[0]
        : children;
  }
  return {
    t,
    k,
    p,
    constructor: undefined,
  };
}

export function render(node, mount, state = {}, wireActions = () => ({})) {
  mount.innerHTML = '';

  let store = {
    state,
    flush: () => {
      _enumerate(elements, (elementKey) => {
        elements[elementKey].used = false;
      });
      _render(node, mount);
      _enumerate(elements, (elementKey) => {
        if (!elements[elementKey].used) {
          // unmount
          let node = elements[elementKey];
          _invoke(node.p, willUnmount, node.el);
          node.el.parentNode.removeChild(node.el);
          delete elements[elementKey];
        }
      });
    },
  };

  let elements = {};

  function getEl(key, node) {
    if (!(key in elements)) {
      elements[key] = {
        el: !node.t
          ? document.createTextNode(node)
          : document.createElement(node.t),
      };
    }
    elements[key].used = true;
    return elements[key].el;
  }

  let actions = wireActions(store);

  _enumerate(actions, (actionKey) => {
    let action = actions[actionKey];
    actions[actionKey] = (...args) => {
      if (action.call(actions, ...args) !== false) {
        store.flush();
      }
    };
  });

  function setProperty(el, name, value, oldValue) {
    name = name.toLowerCase();
    if (name in reservedProps) {
      return;
    }
    name = name === 'classname' ? 'class' : name;
    if (name === 'dangerouslysetinnerhtml') {
      if (oldValue && value.__html === oldValue.__html) {
        return;
      }
      el.innerHTML = value === null ? '' : value.__html;
    } else if (name.startsWith('on')) {
      el[name.toLowerCase()] = value;
    } else {
      if (value === null || value === false) {
        el.removeAttribute(name, value);
      } else {
        if (value === true) {
          value = '';
        }
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

    if (newProps)
      _enumerate(newProps, (prop) => {
        if (oldProps[prop] !== newProps[prop]) {
          setProperty(el, prop, newProps[prop], oldProps[prop]);
        }
      });
  }

  function _render(node, target, prefix = [], idx = 0) {
    if (_falsy(node)) {
      return [];
    }
    if (Array.isArray(node)) {
      let order = [];
      prefix.push('array');
      for (var [i, c] of node.entries()) {
        order.push(..._render(c, target, prefix, i));
      }
      prefix.pop();
      return order;
    } else if (node.t instanceof Function) {
      return _render(
        node.t({
          ...node.p,
          state: store.state,
          actions,
        }),
        target,
        prefix,
        idx,
      );
    } else if (node.t && node.constructor !== undefined) {
      return [];
    }

    prefix.push(node.t || 'text', node.k || idx);

    let key = prefix.join('.');
    let exists = !!elements[key];
    let el = getEl(key, node);
    let order = [];

    if (el instanceof HTMLElement) {
      let oldp = exists ? elements[key].p : {};
      update(el, node.p, oldp);
      let i = 0;
      if (node.p) {
        let ch = node.p[children] || [];
        for (let c of ch) {
          if (!_falsy(c)) {
            order.push(..._render(c, el, prefix, i));
          }
          i++;
        }
      }
      elements[key].p = { ...node.p };
    } else if (el instanceof Text) {
      el.nodeValue = node;
    }

    prefix.splice(-2, 2);

    // reorder
    for (let i = 0; i < order.length; i++) {
      if (el.children[i] !== order[i]) {
        el.insertBefore(order[i], el.children[i]);
      }
    }

    if (!exists) {
      // mount
      target.appendChild(el);
    }

    _invoke(node.p, exists ? didUpdate : didMount, el);

    return [el];
  }

  _render(node, mount);
}

function _falsy(c) {
  return (
    c === true ||
    c === false ||
    c === null ||
    c == undefined ||
    typeof c === 'function'
  );
}

function _enumerate(obj, cb) {
  Object.keys(obj).forEach((key) => {
    cb(key);
  });
}

function _invoke(obj, fn, ...args) {
  obj && obj[fn] && obj[fn](...args);
}

let didUpdate = 'didupdate';
let didMount = 'didmount';
let willUnmount = 'willunmount';
let className = 'classname';
let children = 'children';

let reservedProps = {
  actions: 0,
  state: 0,
  k: 0,
  [children]: 0,
  [willUnmount]: 0,
  [didUpdate]: 0,
  [didMount]: 0,
};
