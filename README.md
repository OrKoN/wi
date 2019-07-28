# wi

A small (1KB gzipped) library for building small embedded apps with API similar
to React with some differences:

- recommended for small apps where one person can understand all details (not
  recommended for bigger apps)
- supports only function components
- offers mutable and directly accessible state accessible to all components
- no support for `style` attribute, only `className`
- `k` is used instead of `key` to unique identify elements in lists
- manual control of re-renders
- diff algorithm is very simple (recommended to use `k` always)

_Note: the lib is in very early stage. It might not work properly at all_

## Examples

There are two examples:

- [counter app](demo/counter)
- [TodoMVC app](demo/todomvc)
