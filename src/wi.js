/*
 -- solve reordering
 -- support svg
 -- tests
 -- dangerously set html
*/

export function h(t, p, ...cs) {
  return {
    t,
    p: {
      ...p,
      [children]: cs
        .filter((c) => c !== false)
        .map((c) =>
          typeof c === 'object'
            ? c
            : {
                t: null,
                p: c,
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
      if (!!action(...args)) store.flush();
    };
  });

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
        idx,
      );
    }

    var key = [...prefix, node.t, idx].join('.');
    var exists = !!elements[key];
    var el = getEl(key, node);

    if (el instanceof HTMLElement) {
      // update
      _enumerate(node.p, (opt) => {
        if (!(opt in specialProps)) {
          el[opt.toLowerCase()] = node.p[opt];
        }
      });

      if (node.p[className]) {
        el.setAttribute('class', node.p[className]);
      }
      if (node.p[dangerouslySetInnerHTML]) {
        el.innerHTML = node.p[dangerouslySetInnerHTML].__html;
      }
      prefix.push(node.t, idx);
      for (var [i, c] of node.p[children].entries()) {
        render(c, el, prefix, i);
      }
      prefix.splice(-2, 2);
    }

    if (el instanceof Text) {
      el.nodeValue = node.p;
    }

    if (exists) {
      _invoke(node.p, didUpdate, el);
    } else {
      // mount
      target.appendChild(el);
      _invoke(node.p, didMount, el);
    }

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
