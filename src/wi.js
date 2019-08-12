/*
  names:
    - p:props
    - t:type
    - k:key

  TODO:
 -- support svg
 -- tests
*/

export function h(t, p, ...childNodes) {
  p = { ...p };
  let k = p && p.k ? p.k : null;
  delete p.k;
  if (arguments.length >= 3) {
    p[children] =
      childNodes.length == 1 && Array.isArray(childNodes[0])
        ? childNodes[0]
        : childNodes;
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

  let elements = {};

  let store = {
    state,
    flush: () => {
      _eachKey(elements, (elementKey) => {
        elements[elementKey].used = false;
      });
      _render(node, mount);
      _eachKey(elements, (elementKey) => {
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

  _eachKey(actions, (actionKey) => {
    let action = actions[actionKey];
    actions[actionKey] = (...args) => {
      action.call(actions, ...args) !== false && store.flush();
    };
  });

  function setProperty(el, name, value, oldValue) {
    name = name.toLowerCase();
    if (name in reservedProps) {
      return;
    }
    name = name === 'classname' ? 'class' : name;
    if (name === 'nodevalue' && value !== oldValue) {
      el.nodevalue = value;
    } else if (name === 'dangerouslysetinnerhtml') {
      if (oldValue && value.__html === oldValue.__html) {
        return;
      }
      el.innerHTML = value.__html;
    } else if (name[0] === 'o' && name[1] === 'n') {
      el[name] = value;
    } else {
      if (value === null || value === false) {
        el.removeAttribute(name, value);
      } else {
        el.setAttribute(name, value);
      }
    }
  }

  function updateElement(el, node, oldProps, key) {
    const newProps = node.p ? { ...node.p } : { nodeValue: node };
    _eachKey(oldProps, (prop) => {
      !(prop in newProps) && setProperty(el, prop, null, oldProps[prop]);
    });
    if (newProps) {
      _eachKey(newProps, (prop) => {
        oldProps[prop] !== newProps[prop] &&
          setProperty(el, prop, newProps[prop], oldProps[prop]);
      });
    }
    return newProps;
  }

  function _renderList(nodes, target, prefix) {
    let i = 0;
    let results = [];
    prefix.push('list');
    for (let node of nodes) {
      !_falsy(node) && results.push(..._render(node, target, prefix, i));
      i++;
    }
    prefix.pop();
    return results;
  }

  function _render(node, target, prefix = [], idx = 0) {
    if (_falsy(node)) {
      return [];
    }
    if (Array.isArray(node)) {
      return _renderList(node, target, prefix);
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
    let order = _renderList((node.p && node.p[children]) || [], el, prefix);

    elements[key].p = updateElement(
      el,
      node,
      exists ? elements[key].p : {},
      key,
    );

    prefix.splice(-2, 2);

    // reorder
    for (let i = 0; i < order.length; i++) {
      el.children[i] !== order[i] && el.insertBefore(order[i], el.children[i]);
    }

    // mount
    !exists && target.appendChild(el);

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

function _eachKey(obj, cb) {
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
