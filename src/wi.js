/*
 -- solve reordering
 -- support svg
 -- tests
 -- dangerously set html
*/

export function h(t, p, ...cs) {
  return {
    t,
    k: p ? p.k : null,
    p: {
      ...p,
      [children]: cs
        .flat()
        .filter((c) => c !== false && c !== null)
        .map((c, i) =>
          typeof c === 'object'
            ? c
            : {
                t: null,
                p: c,
                k: i,
              },
        ),
    },
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

  function update(el, node, oldp) {
    const newp = node.p;
    _enumerate(node.p, (opt) => {
      if (!(opt in specialProps)) {
        if (!oldp || oldp[opt] !== newp[opt]) {
          el[opt.toLowerCase()] = newp[opt];
        }
      }
    });
    if (newp && newp[className]) {
      el.setAttribute('class', newp[className]);
    } else {
      el.removeAttribute('class');
    }
    if (newp[dangerouslySetInnerHTML]) {
      if (
        !oldp ||
        oldp[dangerouslySetInnerHTML].__html !==
          newp[dangerouslySetInnerHTML].__html
      ) {
        el.innerHTML = newp[dangerouslySetInnerHTML].__html;
      }
    }
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

    var key = [...prefix, node.t || 'text', node.k || idx].join('.');
    var exists = !!elements[key];
    var el = getEl(key, node);
    var order = [];

    if (el instanceof HTMLElement) {
      if (exists) {
        update(el, node, elements[key].p);
      } else {
        update(el, node);
      }
      elements[key].p = { ...node.p };

      prefix.push(node.t, node.k || idx);
      var i = 0;
      for (var c of node.p[children]) {
        order.push(render(c, el, prefix, i));
        i++;
      }
      prefix.splice(-2, 2);
    } else if (el instanceof Text) {
      el.nodeValue = node.p;
    }

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
var dangerouslySetInnerHTML = 'dangerouslySetInnerHTML';
var className = 'className';
var children = 'children';

var specialProps = {
  actions: 0,
  state: 0,
  [children]: 0,
  [className]: 0,
  [willUnmount]: 0,
  [didUpdate]: 0,
  [didMount]: 0,
  [dangerouslySetInnerHTML]: 0,
};
