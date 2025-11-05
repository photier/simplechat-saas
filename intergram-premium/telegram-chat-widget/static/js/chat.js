/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(26);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	!function(global, factory) {
	     true ? factory(exports) : 'function' == typeof define && define.amd ? define([ 'exports' ], factory) : factory(global.preact = global.preact || {});
	}(this, function(exports) {
	    function VNode(nodeName, attributes, children) {
	        this.nodeName = nodeName;
	        this.attributes = attributes;
	        this.children = children;
	        this.key = attributes && attributes.key;
	    }
	    function h(nodeName, attributes) {
	        var children, lastSimple, child, simple, i;
	        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
	        if (attributes && attributes.children) {
	            if (!stack.length) stack.push(attributes.children);
	            delete attributes.children;
	        }
	        while (stack.length) if ((child = stack.pop()) instanceof Array) for (i = child.length; i--; ) stack.push(child[i]); else if (null != child && child !== !0 && child !== !1) {
	            if ('number' == typeof child) child = String(child);
	            simple = 'string' == typeof child;
	            if (simple && lastSimple) children[children.length - 1] += child; else {
	                (children || (children = [])).push(child);
	                lastSimple = simple;
	            }
	        }
	        var p = new VNode(nodeName, attributes || void 0, children || EMPTY_CHILDREN);
	        if (options.vnode) options.vnode(p);
	        return p;
	    }
	    function extend(obj, props) {
	        if (props) for (var i in props) obj[i] = props[i];
	        return obj;
	    }
	    function clone(obj) {
	        return extend({}, obj);
	    }
	    function delve(obj, key) {
	        for (var p = key.split('.'), i = 0; i < p.length && obj; i++) obj = obj[p[i]];
	        return obj;
	    }
	    function isFunction(obj) {
	        return 'function' == typeof obj;
	    }
	    function isString(obj) {
	        return 'string' == typeof obj;
	    }
	    function hashToClassName(c) {
	        var str = '';
	        for (var prop in c) if (c[prop]) {
	            if (str) str += ' ';
	            str += prop;
	        }
	        return str;
	    }
	    function cloneElement(vnode, props) {
	        return h(vnode.nodeName, extend(clone(vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
	    }
	    function createLinkedState(component, key, eventPath) {
	        var path = key.split('.');
	        return function(e) {
	            var t = e && e.target || this, state = {}, obj = state, v = isString(eventPath) ? delve(e, eventPath) : t.nodeName ? t.type.match(/^che|rad/) ? t.checked : t.value : e, i = 0;
	            for (;i < path.length - 1; i++) obj = obj[path[i]] || (obj[path[i]] = !i && component.state[path[i]] || {});
	            obj[path[i]] = v;
	            component.setState(state);
	        };
	    }
	    function enqueueRender(component) {
	        if (!component._dirty && (component._dirty = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
	    }
	    function rerender() {
	        var p, list = items;
	        items = [];
	        while (p = list.pop()) if (p._dirty) renderComponent(p);
	    }
	    function isFunctionalComponent(vnode) {
	        var nodeName = vnode && vnode.nodeName;
	        return nodeName && isFunction(nodeName) && !(nodeName.prototype && nodeName.prototype.render);
	    }
	    function buildFunctionalComponent(vnode, context) {
	        return vnode.nodeName(getNodeProps(vnode), context || EMPTY);
	    }
	    function isSameNodeType(node, vnode) {
	        if (isString(vnode)) return node instanceof Text;
	        if (isString(vnode.nodeName)) return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	        if (isFunction(vnode.nodeName)) return (node._componentConstructor ? node._componentConstructor === vnode.nodeName : !0) || isFunctionalComponent(vnode); else return;
	    }
	    function isNamedNode(node, nodeName) {
	        return node.normalizedNodeName === nodeName || toLowerCase(node.nodeName) === toLowerCase(nodeName);
	    }
	    function getNodeProps(vnode) {
	        var props = clone(vnode.attributes);
	        props.children = vnode.children;
	        var defaultProps = vnode.nodeName.defaultProps;
	        if (defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
	        return props;
	    }
	    function removeNode(node) {
	        var p = node.parentNode;
	        if (p) p.removeChild(node);
	    }
	    function setAccessor(node, name, old, value, isSvg) {
	        if ('className' === name) name = 'class';
	        if ('class' === name && value && 'object' == typeof value) value = hashToClassName(value);
	        if ('key' === name) ; else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
	            if (!value || isString(value) || isString(old)) node.style.cssText = value || '';
	            if (value && 'object' == typeof value) {
	                if (!isString(old)) for (var i in old) if (!(i in value)) node.style[i] = '';
	                for (var i in value) node.style[i] = 'number' == typeof value[i] && !NON_DIMENSION_PROPS[i] ? value[i] + 'px' : value[i];
	            }
	        } else if ('dangerouslySetInnerHTML' === name) {
	            if (value) node.innerHTML = value.__html || '';
	        } else if ('o' == name[0] && 'n' == name[1]) {
	            var l = node._listeners || (node._listeners = {});
	            name = toLowerCase(name.substring(2));
	            if (value) {
	                if (!l[name]) node.addEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
	            } else if (l[name]) node.removeEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
	            l[name] = value;
	        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
	            setProperty(node, name, null == value ? '' : value);
	            if (null == value || value === !1) node.removeAttribute(name);
	        } else {
	            var ns = isSvg && name.match(/^xlink\:?(.+)/);
	            if (null == value || value === !1) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1])); else node.removeAttribute(name); else if ('object' != typeof value && !isFunction(value)) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1]), value); else node.setAttribute(name, value);
	        }
	    }
	    function setProperty(node, name, value) {
	        try {
	            node[name] = value;
	        } catch (e) {}
	    }
	    function eventProxy(e) {
	        return this._listeners[e.type](options.event && options.event(e) || e);
	    }
	    function collectNode(node) {
	        removeNode(node);
	        if (node instanceof Element) {
	            node._component = node._componentConstructor = null;
	            var _name = node.normalizedNodeName || toLowerCase(node.nodeName);
	            (nodes[_name] || (nodes[_name] = [])).push(node);
	        }
	    }
	    function createNode(nodeName, isSvg) {
	        var name = toLowerCase(nodeName), node = nodes[name] && nodes[name].pop() || (isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName));
	        node.normalizedNodeName = name;
	        return node;
	    }
	    function flushMounts() {
	        var c;
	        while (c = mounts.pop()) {
	            if (options.afterMount) options.afterMount(c);
	            if (c.componentDidMount) c.componentDidMount();
	        }
	    }
	    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	        if (!diffLevel++) {
	            isSvgMode = parent && void 0 !== parent.ownerSVGElement;
	            hydrating = dom && !(ATTR_KEY in dom);
	        }
	        var ret = idiff(dom, vnode, context, mountAll);
	        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
	        if (!--diffLevel) {
	            hydrating = !1;
	            if (!componentRoot) flushMounts();
	        }
	        return ret;
	    }
	    function idiff(dom, vnode, context, mountAll) {
	        var ref = vnode && vnode.attributes && vnode.attributes.ref;
	        while (isFunctionalComponent(vnode)) vnode = buildFunctionalComponent(vnode, context);
	        if (null == vnode) vnode = '';
	        if (isString(vnode)) {
	            if (dom && dom instanceof Text && dom.parentNode) {
	                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
	            } else {
	                if (dom) recollectNodeTree(dom);
	                dom = document.createTextNode(vnode);
	            }
	            return dom;
	        }
	        if (isFunction(vnode.nodeName)) return buildComponentFromVNode(dom, vnode, context, mountAll);
	        var out = dom, nodeName = String(vnode.nodeName), prevSvgMode = isSvgMode, vchildren = vnode.children;
	        isSvgMode = 'svg' === nodeName ? !0 : 'foreignObject' === nodeName ? !1 : isSvgMode;
	        if (!dom) out = createNode(nodeName, isSvgMode); else if (!isNamedNode(dom, nodeName)) {
	            out = createNode(nodeName, isSvgMode);
	            while (dom.firstChild) out.appendChild(dom.firstChild);
	            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
	            recollectNodeTree(dom);
	        }
	        var fc = out.firstChild, props = out[ATTR_KEY];
	        if (!props) {
	            out[ATTR_KEY] = props = {};
	            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
	        }
	        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && fc && fc instanceof Text && !fc.nextSibling) {
	            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
	        } else if (vchildren && vchildren.length || fc) innerDiffNode(out, vchildren, context, mountAll, !!props.dangerouslySetInnerHTML);
	        diffAttributes(out, vnode.attributes, props);
	        if (ref) (props.ref = ref)(out);
	        isSvgMode = prevSvgMode;
	        return out;
	    }
	    function innerDiffNode(dom, vchildren, context, mountAll, absorb) {
	        var j, c, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren && vchildren.length;
	        if (len) for (var i = 0; i < len; i++) {
	            var _child = originalChildren[i], props = _child[ATTR_KEY], key = vlen ? (c = _child._component) ? c.__key : props ? props.key : null : null;
	            if (null != key) {
	                keyedLen++;
	                keyed[key] = _child;
	            } else if (hydrating || absorb || props || _child instanceof Text) children[childrenLen++] = _child;
	        }
	        if (vlen) for (var i = 0; i < vlen; i++) {
	            vchild = vchildren[i];
	            child = null;
	            var key = vchild.key;
	            if (null != key) {
	                if (keyedLen && key in keyed) {
	                    child = keyed[key];
	                    keyed[key] = void 0;
	                    keyedLen--;
	                }
	            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) {
	                c = children[j];
	                if (c && isSameNodeType(c, vchild)) {
	                    child = c;
	                    children[j] = void 0;
	                    if (j === childrenLen - 1) childrenLen--;
	                    if (j === min) min++;
	                    break;
	                }
	            }
	            child = idiff(child, vchild, context, mountAll);
	            if (child && child !== dom) if (i >= len) dom.appendChild(child); else if (child !== originalChildren[i]) {
	                if (child === originalChildren[i + 1]) removeNode(originalChildren[i]);
	                dom.insertBefore(child, originalChildren[i] || null);
	            }
	        }
	        if (keyedLen) for (var i in keyed) if (keyed[i]) recollectNodeTree(keyed[i]);
	        while (min <= childrenLen) {
	            child = children[childrenLen--];
	            if (child) recollectNodeTree(child);
	        }
	    }
	    function recollectNodeTree(node, unmountOnly) {
	        var component = node._component;
	        if (component) unmountComponent(component, !unmountOnly); else {
	            if (node[ATTR_KEY] && node[ATTR_KEY].ref) node[ATTR_KEY].ref(null);
	            if (!unmountOnly) collectNode(node);
	            var c;
	            while (c = node.lastChild) recollectNodeTree(c, unmountOnly);
	        }
	    }
	    function diffAttributes(dom, attrs, old) {
	        var name;
	        for (name in old) if (!(attrs && name in attrs) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
	        if (attrs) for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
	    }
	    function collectComponent(component) {
	        var name = component.constructor.name, list = components[name];
	        if (list) list.push(component); else components[name] = [ component ];
	    }
	    function createComponent(Ctor, props, context) {
	        var inst = new Ctor(props, context), list = components[Ctor.name];
	        Component.call(inst, props, context);
	        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
	            inst.nextBase = list[i].nextBase;
	            list.splice(i, 1);
	            break;
	        }
	        return inst;
	    }
	    function setComponentProps(component, props, opts, context, mountAll) {
	        if (!component._disable) {
	            component._disable = !0;
	            if (component.__ref = props.ref) delete props.ref;
	            if (component.__key = props.key) delete props.key;
	            if (!component.base || mountAll) {
	                if (component.componentWillMount) component.componentWillMount();
	            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
	            if (context && context !== component.context) {
	                if (!component.prevContext) component.prevContext = component.context;
	                component.context = context;
	            }
	            if (!component.prevProps) component.prevProps = component.props;
	            component.props = props;
	            component._disable = !1;
	            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
	            if (component.__ref) component.__ref(component);
	        }
	    }
	    function renderComponent(component, opts, mountAll, isChild) {
	        if (!component._disable) {
	            var skip, rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.prevProps || props, previousState = component.prevState || state, previousContext = component.prevContext || context, isUpdate = component.base, nextBase = component.nextBase, initialBase = isUpdate || nextBase, initialChildComponent = component._component;
	            if (isUpdate) {
	                component.props = previousProps;
	                component.state = previousState;
	                component.context = previousContext;
	                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
	                component.props = props;
	                component.state = state;
	                component.context = context;
	            }
	            component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	            component._dirty = !1;
	            if (!skip) {
	                if (component.render) rendered = component.render(props, state, context);
	                if (component.getChildContext) context = extend(clone(context), component.getChildContext());
	                while (isFunctionalComponent(rendered)) rendered = buildFunctionalComponent(rendered, context);
	                var toUnmount, base, childComponent = rendered && rendered.nodeName;
	                if (isFunction(childComponent)) {
	                    var childProps = getNodeProps(rendered);
	                    inst = initialChildComponent;
	                    if (inst && inst.constructor === childComponent && childProps.key == inst.__key) setComponentProps(inst, childProps, 1, context); else {
	                        toUnmount = inst;
	                        inst = createComponent(childComponent, childProps, context);
	                        inst.nextBase = inst.nextBase || nextBase;
	                        inst._parentComponent = component;
	                        component._component = inst;
	                        setComponentProps(inst, childProps, 0, context);
	                        renderComponent(inst, 1, mountAll, !0);
	                    }
	                    base = inst.base;
	                } else {
	                    cbase = initialBase;
	                    toUnmount = initialChildComponent;
	                    if (toUnmount) cbase = component._component = null;
	                    if (initialBase || 1 === opts) {
	                        if (cbase) cbase._component = null;
	                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
	                    }
	                }
	                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
	                    var baseParent = initialBase.parentNode;
	                    if (baseParent && base !== baseParent) {
	                        baseParent.replaceChild(base, initialBase);
	                        if (!toUnmount) {
	                            initialBase._component = null;
	                            recollectNodeTree(initialBase);
	                        }
	                    }
	                }
	                if (toUnmount) unmountComponent(toUnmount, base !== initialBase);
	                component.base = base;
	                if (base && !isChild) {
	                    var componentRef = component, t = component;
	                    while (t = t._parentComponent) (componentRef = t).base = base;
	                    base._component = componentRef;
	                    base._componentConstructor = componentRef.constructor;
	                }
	            }
	            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
	                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
	                if (options.afterUpdate) options.afterUpdate(component);
	            }
	            var fn, cb = component._renderCallbacks;
	            if (cb) while (fn = cb.pop()) fn.call(component);
	            if (!diffLevel && !isChild) flushMounts();
	        }
	    }
	    function buildComponentFromVNode(dom, vnode, context, mountAll) {
	        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
	        while (c && !isOwner && (c = c._parentComponent)) isOwner = c.constructor === vnode.nodeName;
	        if (c && isOwner && (!mountAll || c._component)) {
	            setComponentProps(c, props, 3, context, mountAll);
	            dom = c.base;
	        } else {
	            if (originalComponent && !isDirectOwner) {
	                unmountComponent(originalComponent, !0);
	                dom = oldDom = null;
	            }
	            c = createComponent(vnode.nodeName, props, context);
	            if (dom && !c.nextBase) {
	                c.nextBase = dom;
	                oldDom = null;
	            }
	            setComponentProps(c, props, 1, context, mountAll);
	            dom = c.base;
	            if (oldDom && dom !== oldDom) {
	                oldDom._component = null;
	                recollectNodeTree(oldDom);
	            }
	        }
	        return dom;
	    }
	    function unmountComponent(component, remove) {
	        if (options.beforeUnmount) options.beforeUnmount(component);
	        var base = component.base;
	        component._disable = !0;
	        if (component.componentWillUnmount) component.componentWillUnmount();
	        component.base = null;
	        var inner = component._component;
	        if (inner) unmountComponent(inner, remove); else if (base) {
	            if (base[ATTR_KEY] && base[ATTR_KEY].ref) base[ATTR_KEY].ref(null);
	            component.nextBase = base;
	            if (remove) {
	                removeNode(base);
	                collectComponent(component);
	            }
	            var c;
	            while (c = base.lastChild) recollectNodeTree(c, !remove);
	        }
	        if (component.__ref) component.__ref(null);
	        if (component.componentDidUnmount) component.componentDidUnmount();
	    }
	    function Component(props, context) {
	        this._dirty = !0;
	        this.context = context;
	        this.props = props;
	        if (!this.state) this.state = {};
	    }
	    function render(vnode, parent, merge) {
	        return diff(merge, vnode, {}, !1, parent);
	    }
	    var options = {};
	    var stack = [];
	    var EMPTY_CHILDREN = [];
	    var lcCache = {};
	    var toLowerCase = function(s) {
	        return lcCache[s] || (lcCache[s] = s.toLowerCase());
	    };
	    var resolved = 'undefined' != typeof Promise && Promise.resolve();
	    var defer = resolved ? function(f) {
	        resolved.then(f);
	    } : setTimeout;
	    var EMPTY = {};
	    var ATTR_KEY = 'undefined' != typeof Symbol ? Symbol.for('preactattr') : '__preactattr_';
	    var NON_DIMENSION_PROPS = {
	        boxFlex: 1,
	        boxFlexGroup: 1,
	        columnCount: 1,
	        fillOpacity: 1,
	        flex: 1,
	        flexGrow: 1,
	        flexPositive: 1,
	        flexShrink: 1,
	        flexNegative: 1,
	        fontWeight: 1,
	        lineClamp: 1,
	        lineHeight: 1,
	        opacity: 1,
	        order: 1,
	        orphans: 1,
	        strokeOpacity: 1,
	        widows: 1,
	        zIndex: 1,
	        zoom: 1
	    };
	    var NON_BUBBLING_EVENTS = {
	        blur: 1,
	        error: 1,
	        focus: 1,
	        load: 1,
	        resize: 1,
	        scroll: 1
	    };
	    var items = [];
	    var nodes = {};
	    var mounts = [];
	    var diffLevel = 0;
	    var isSvgMode = !1;
	    var hydrating = !1;
	    var components = {};
	    extend(Component.prototype, {
	        linkState: function(key, eventPath) {
	            var c = this._linkedStates || (this._linkedStates = {});
	            return c[key + eventPath] || (c[key + eventPath] = createLinkedState(this, key, eventPath));
	        },
	        setState: function(state, callback) {
	            var s = this.state;
	            if (!this.prevState) this.prevState = clone(s);
	            extend(s, isFunction(state) ? state(s, this.props) : state);
	            if (callback) (this._renderCallbacks = this._renderCallbacks || []).push(callback);
	            enqueueRender(this);
	        },
	        forceUpdate: function() {
	            renderComponent(this, 2);
	        },
	        render: function() {}
	    });
	    exports.h = h;
	    exports.cloneElement = cloneElement;
	    exports.Component = Component;
	    exports.render = render;
	    exports.rerender = rerender;
	    exports.options = options;
	});
	//# sourceMappingURL=preact.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	exports.Emitter = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	}
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	
	  // Remove event specific arrays for event types that no
	  // one is subscribed for to avoid memory leak.
	  if (callbacks.length === 0) {
	    delete this._callbacks['$' + event];
	  }
	
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	
	  var args = new Array(arguments.length - 1)
	    , callbacks = this._callbacks['$' + event];
	
	  for (var i = 1; i < arguments.length; i++) {
	    args[i - 1] = arguments[i];
	  }
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	// alias used for reserved events (protected method)
	Emitter.prototype.emitReserved = Emitter.prototype.emit;
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultBinaryType = exports.globalThisShim = exports.nextTick = void 0;
	exports.createCookieJar = createCookieJar;
	exports.nextTick = (() => {
	    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
	    if (isPromiseAvailable) {
	        return (cb) => Promise.resolve().then(cb);
	    }
	    else {
	        return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
	    }
	})();
	exports.globalThisShim = (() => {
	    if (typeof self !== "undefined") {
	        return self;
	    }
	    else if (typeof window !== "undefined") {
	        return window;
	    }
	    else {
	        return Function("return this")();
	    }
	})();
	exports.defaultBinaryType = "arraybuffer";
	function createCookieJar() { }


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pick = pick;
	exports.installTimerFunctions = installTimerFunctions;
	exports.byteLength = byteLength;
	exports.randomString = randomString;
	const globals_node_js_1 = __webpack_require__(3);
	function pick(obj, ...attr) {
	    return attr.reduce((acc, k) => {
	        if (obj.hasOwnProperty(k)) {
	            acc[k] = obj[k];
	        }
	        return acc;
	    }, {});
	}
	// Keep a reference to the real timeout functions so they can be used when overridden
	const NATIVE_SET_TIMEOUT = globals_node_js_1.globalThisShim.setTimeout;
	const NATIVE_CLEAR_TIMEOUT = globals_node_js_1.globalThisShim.clearTimeout;
	function installTimerFunctions(obj, opts) {
	    if (opts.useNativeTimers) {
	        obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globals_node_js_1.globalThisShim);
	        obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globals_node_js_1.globalThisShim);
	    }
	    else {
	        obj.setTimeoutFn = globals_node_js_1.globalThisShim.setTimeout.bind(globals_node_js_1.globalThisShim);
	        obj.clearTimeoutFn = globals_node_js_1.globalThisShim.clearTimeout.bind(globals_node_js_1.globalThisShim);
	    }
	}
	// base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
	const BASE64_OVERHEAD = 1.33;
	// we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
	function byteLength(obj) {
	    if (typeof obj === "string") {
	        return utf8Length(obj);
	    }
	    // arraybuffer or blob
	    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
	}
	function utf8Length(str) {
	    let c = 0, length = 0;
	    for (let i = 0, l = str.length; i < l; i++) {
	        c = str.charCodeAt(i);
	        if (c < 0x80) {
	            length += 1;
	        }
	        else if (c < 0x800) {
	            length += 2;
	        }
	        else if (c < 0xd800 || c >= 0xe000) {
	            length += 3;
	        }
	        else {
	            i++;
	            length += 4;
	        }
	    }
	    return length;
	}
	/**
	 * Generates a random 8-characters string.
	 */
	function randomString() {
	    return (Date.now().toString(36).substring(3) +
	        Math.random().toString(36).substring(2, 5));
	}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/* eslint-env browser */
	
	/**
	 * This is the web browser implementation of `debug()`.
	 */
	
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
	
		return () => {
			if (!warned) {
				warned = true;
				console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
			}
		};
	})();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}
	
		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}
	
		let m;
	
		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);
	
		if (!this.useColors) {
			return;
		}
	
		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');
	
		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});
	
		args.splice(lastC, 0, c);
	}
	
	/**
	 * Invokes `console.debug()` when available.
	 * No-op when `console.debug` is not a "function".
	 * If `console.debug` is not available, falls back
	 * to `console.log`.
	 *
	 * @api public
	 */
	exports.log = console.debug || console.log || (() => {});
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	
		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = ({"NODE_ENV":"production"}).DEBUG;
		}
	
		return r;
	}
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}
	
	module.exports = __webpack_require__(40)(exports);
	
	const {formatters} = module.exports;
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodePayload = exports.decodePacket = exports.encodePayload = exports.encodePacket = exports.protocol = void 0;
	exports.createPacketEncoderStream = createPacketEncoderStream;
	exports.createPacketDecoderStream = createPacketDecoderStream;
	const encodePacket_js_1 = __webpack_require__(44);
	Object.defineProperty(exports, "encodePacket", { enumerable: true, get: function () { return encodePacket_js_1.encodePacket; } });
	const decodePacket_js_1 = __webpack_require__(43);
	Object.defineProperty(exports, "decodePacket", { enumerable: true, get: function () { return decodePacket_js_1.decodePacket; } });
	const commons_js_1 = __webpack_require__(12);
	const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
	const encodePayload = (packets, callback) => {
	    // some packets may be added to the array while encoding, so the initial length must be saved
	    const length = packets.length;
	    const encodedPackets = new Array(length);
	    let count = 0;
	    packets.forEach((packet, i) => {
	        // force base64 encoding for binary packets
	        (0, encodePacket_js_1.encodePacket)(packet, false, (encodedPacket) => {
	            encodedPackets[i] = encodedPacket;
	            if (++count === length) {
	                callback(encodedPackets.join(SEPARATOR));
	            }
	        });
	    });
	};
	exports.encodePayload = encodePayload;
	const decodePayload = (encodedPayload, binaryType) => {
	    const encodedPackets = encodedPayload.split(SEPARATOR);
	    const packets = [];
	    for (let i = 0; i < encodedPackets.length; i++) {
	        const decodedPacket = (0, decodePacket_js_1.decodePacket)(encodedPackets[i], binaryType);
	        packets.push(decodedPacket);
	        if (decodedPacket.type === "error") {
	            break;
	        }
	    }
	    return packets;
	};
	exports.decodePayload = decodePayload;
	function createPacketEncoderStream() {
	    return new TransformStream({
	        transform(packet, controller) {
	            (0, encodePacket_js_1.encodePacketToBinary)(packet, (encodedPacket) => {
	                const payloadLength = encodedPacket.length;
	                let header;
	                // inspired by the WebSocket format: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#decoding_payload_length
	                if (payloadLength < 126) {
	                    header = new Uint8Array(1);
	                    new DataView(header.buffer).setUint8(0, payloadLength);
	                }
	                else if (payloadLength < 65536) {
	                    header = new Uint8Array(3);
	                    const view = new DataView(header.buffer);
	                    view.setUint8(0, 126);
	                    view.setUint16(1, payloadLength);
	                }
	                else {
	                    header = new Uint8Array(9);
	                    const view = new DataView(header.buffer);
	                    view.setUint8(0, 127);
	                    view.setBigUint64(1, BigInt(payloadLength));
	                }
	                // first bit indicates whether the payload is plain text (0) or binary (1)
	                if (packet.data && typeof packet.data !== "string") {
	                    header[0] |= 0x80;
	                }
	                controller.enqueue(header);
	                controller.enqueue(encodedPacket);
	            });
	        },
	    });
	}
	let TEXT_DECODER;
	function totalLength(chunks) {
	    return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	}
	function concatChunks(chunks, size) {
	    if (chunks[0].length === size) {
	        return chunks.shift();
	    }
	    const buffer = new Uint8Array(size);
	    let j = 0;
	    for (let i = 0; i < size; i++) {
	        buffer[i] = chunks[0][j++];
	        if (j === chunks[0].length) {
	            chunks.shift();
	            j = 0;
	        }
	    }
	    if (chunks.length && j < chunks[0].length) {
	        chunks[0] = chunks[0].slice(j);
	    }
	    return buffer;
	}
	function createPacketDecoderStream(maxPayload, binaryType) {
	    if (!TEXT_DECODER) {
	        TEXT_DECODER = new TextDecoder();
	    }
	    const chunks = [];
	    let state = 0 /* State.READ_HEADER */;
	    let expectedLength = -1;
	    let isBinary = false;
	    return new TransformStream({
	        transform(chunk, controller) {
	            chunks.push(chunk);
	            while (true) {
	                if (state === 0 /* State.READ_HEADER */) {
	                    if (totalLength(chunks) < 1) {
	                        break;
	                    }
	                    const header = concatChunks(chunks, 1);
	                    isBinary = (header[0] & 0x80) === 0x80;
	                    expectedLength = header[0] & 0x7f;
	                    if (expectedLength < 126) {
	                        state = 3 /* State.READ_PAYLOAD */;
	                    }
	                    else if (expectedLength === 126) {
	                        state = 1 /* State.READ_EXTENDED_LENGTH_16 */;
	                    }
	                    else {
	                        state = 2 /* State.READ_EXTENDED_LENGTH_64 */;
	                    }
	                }
	                else if (state === 1 /* State.READ_EXTENDED_LENGTH_16 */) {
	                    if (totalLength(chunks) < 2) {
	                        break;
	                    }
	                    const headerArray = concatChunks(chunks, 2);
	                    expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
	                    state = 3 /* State.READ_PAYLOAD */;
	                }
	                else if (state === 2 /* State.READ_EXTENDED_LENGTH_64 */) {
	                    if (totalLength(chunks) < 8) {
	                        break;
	                    }
	                    const headerArray = concatChunks(chunks, 8);
	                    const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
	                    const n = view.getUint32(0);
	                    if (n > Math.pow(2, 53 - 32) - 1) {
	                        // the maximum safe integer in JavaScript is 2^53 - 1
	                        controller.enqueue(commons_js_1.ERROR_PACKET);
	                        break;
	                    }
	                    expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
	                    state = 3 /* State.READ_PAYLOAD */;
	                }
	                else {
	                    if (totalLength(chunks) < expectedLength) {
	                        break;
	                    }
	                    const data = concatChunks(chunks, expectedLength);
	                    controller.enqueue((0, decodePacket_js_1.decodePacket)(isBinary ? data : TEXT_DECODER.decode(data), binaryType));
	                    state = 0 /* State.READ_HEADER */;
	                }
	                if (expectedLength === 0 || expectedLength > maxPayload) {
	                    controller.enqueue(commons_js_1.ERROR_PACKET);
	                    break;
	                }
	            }
	        },
	    });
	}
	exports.protocol = 4;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Transport = exports.TransportError = void 0;
	const engine_io_parser_1 = __webpack_require__(6);
	const component_emitter_1 = __webpack_require__(2);
	const util_js_1 = __webpack_require__(4);
	const parseqs_js_1 = __webpack_require__(16);
	const debug_1 = __importDefault(__webpack_require__(5)); // debug()
	const debug = (0, debug_1.default)("engine.io-client:transport"); // debug()
	class TransportError extends Error {
	    constructor(reason, description, context) {
	        super(reason);
	        this.description = description;
	        this.context = context;
	        this.type = "TransportError";
	    }
	}
	exports.TransportError = TransportError;
	class Transport extends component_emitter_1.Emitter {
	    /**
	     * Transport abstract constructor.
	     *
	     * @param {Object} opts - options
	     * @protected
	     */
	    constructor(opts) {
	        super();
	        this.writable = false;
	        (0, util_js_1.installTimerFunctions)(this, opts);
	        this.opts = opts;
	        this.query = opts.query;
	        this.socket = opts.socket;
	        this.supportsBinary = !opts.forceBase64;
	    }
	    /**
	     * Emits an error.
	     *
	     * @param {String} reason
	     * @param description
	     * @param context - the error context
	     * @return {Transport} for chaining
	     * @protected
	     */
	    onError(reason, description, context) {
	        super.emitReserved("error", new TransportError(reason, description, context));
	        return this;
	    }
	    /**
	     * Opens the transport.
	     */
	    open() {
	        this.readyState = "opening";
	        this.doOpen();
	        return this;
	    }
	    /**
	     * Closes the transport.
	     */
	    close() {
	        if (this.readyState === "opening" || this.readyState === "open") {
	            this.doClose();
	            this.onClose();
	        }
	        return this;
	    }
	    /**
	     * Sends multiple packets.
	     *
	     * @param {Array} packets
	     */
	    send(packets) {
	        if (this.readyState === "open") {
	            this.write(packets);
	        }
	        else {
	            // this might happen if the transport was silently closed in the beforeunload event handler
	            debug("transport is not open, discarding packets");
	        }
	    }
	    /**
	     * Called upon open
	     *
	     * @protected
	     */
	    onOpen() {
	        this.readyState = "open";
	        this.writable = true;
	        super.emitReserved("open");
	    }
	    /**
	     * Called with data.
	     *
	     * @param {String} data
	     * @protected
	     */
	    onData(data) {
	        const packet = (0, engine_io_parser_1.decodePacket)(data, this.socket.binaryType);
	        this.onPacket(packet);
	    }
	    /**
	     * Called with a decoded packet.
	     *
	     * @protected
	     */
	    onPacket(packet) {
	        super.emitReserved("packet", packet);
	    }
	    /**
	     * Called upon close.
	     *
	     * @protected
	     */
	    onClose(details) {
	        this.readyState = "closed";
	        super.emitReserved("close", details);
	    }
	    /**
	     * Pauses the transport, in order not to lose packets during an upgrade.
	     *
	     * @param onPause
	     */
	    pause(onPause) { }
	    createUri(schema, query = {}) {
	        return (schema +
	            "://" +
	            this._hostname() +
	            this._port() +
	            this.opts.path +
	            this._query(query));
	    }
	    _hostname() {
	        const hostname = this.opts.hostname;
	        return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
	    }
	    _port() {
	        if (this.opts.port &&
	            ((this.opts.secure && Number(this.opts.port !== 443)) ||
	                (!this.opts.secure && Number(this.opts.port) !== 80))) {
	            return ":" + this.opts.port;
	        }
	        else {
	            return "";
	        }
	    }
	    _query(query) {
	        const encodedQuery = (0, parseqs_js_1.encode)(query);
	        return encodedQuery.length ? "?" + encodedQuery : "";
	    }
	}
	exports.Transport = Transport;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/* eslint-env browser */
	
	/**
	 * This is the web browser implementation of `debug()`.
	 */
	
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
	
		return () => {
			if (!warned) {
				warned = true;
				console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
			}
		};
	})();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}
	
		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}
	
		let m;
	
		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);
	
		if (!this.useColors) {
			return;
		}
	
		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');
	
		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});
	
		args.splice(lastC, 0, c);
	}
	
	/**
	 * Invokes `console.debug()` when available.
	 * No-op when `console.debug` is not a "function".
	 * If `console.debug` is not available, falls back
	 * to `console.log`.
	 *
	 * @api public
	 */
	exports.log = console.debug || console.log || (() => {});
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	
		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = ({"NODE_ENV":"production"}).DEBUG;
		}
	
		return r;
	}
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}
	
	module.exports = __webpack_require__(54)(exports);
	
	const {formatters} = module.exports;
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebTransport = exports.WebSocket = exports.NodeWebSocket = exports.XHR = exports.NodeXHR = exports.Fetch = exports.nextTick = exports.parse = exports.installTimerFunctions = exports.transports = exports.TransportError = exports.Transport = exports.protocol = exports.SocketWithUpgrade = exports.SocketWithoutUpgrade = exports.Socket = void 0;
	const socket_js_1 = __webpack_require__(18);
	Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_js_1.Socket; } });
	var socket_js_2 = __webpack_require__(18);
	Object.defineProperty(exports, "SocketWithoutUpgrade", { enumerable: true, get: function () { return socket_js_2.SocketWithoutUpgrade; } });
	Object.defineProperty(exports, "SocketWithUpgrade", { enumerable: true, get: function () { return socket_js_2.SocketWithUpgrade; } });
	exports.protocol = socket_js_1.Socket.protocol;
	var transport_js_1 = __webpack_require__(7);
	Object.defineProperty(exports, "Transport", { enumerable: true, get: function () { return transport_js_1.Transport; } });
	Object.defineProperty(exports, "TransportError", { enumerable: true, get: function () { return transport_js_1.TransportError; } });
	var index_js_1 = __webpack_require__(19);
	Object.defineProperty(exports, "transports", { enumerable: true, get: function () { return index_js_1.transports; } });
	var util_js_1 = __webpack_require__(4);
	Object.defineProperty(exports, "installTimerFunctions", { enumerable: true, get: function () { return util_js_1.installTimerFunctions; } });
	var parseuri_js_1 = __webpack_require__(17);
	Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parseuri_js_1.parse; } });
	var globals_node_js_1 = __webpack_require__(3);
	Object.defineProperty(exports, "nextTick", { enumerable: true, get: function () { return globals_node_js_1.nextTick; } });
	var polling_fetch_js_1 = __webpack_require__(39);
	Object.defineProperty(exports, "Fetch", { enumerable: true, get: function () { return polling_fetch_js_1.Fetch; } });
	var polling_xhr_node_js_1 = __webpack_require__(10);
	Object.defineProperty(exports, "NodeXHR", { enumerable: true, get: function () { return polling_xhr_node_js_1.XHR; } });
	var polling_xhr_js_1 = __webpack_require__(10);
	Object.defineProperty(exports, "XHR", { enumerable: true, get: function () { return polling_xhr_js_1.XHR; } });
	var websocket_node_js_1 = __webpack_require__(11);
	Object.defineProperty(exports, "NodeWebSocket", { enumerable: true, get: function () { return websocket_node_js_1.WS; } });
	var websocket_js_1 = __webpack_require__(11);
	Object.defineProperty(exports, "WebSocket", { enumerable: true, get: function () { return websocket_js_1.WS; } });
	var webtransport_js_1 = __webpack_require__(21);
	Object.defineProperty(exports, "WebTransport", { enumerable: true, get: function () { return webtransport_js_1.WT; } });


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.XHR = exports.Request = exports.BaseXHR = void 0;
	const polling_js_1 = __webpack_require__(20);
	const component_emitter_1 = __webpack_require__(2);
	const util_js_1 = __webpack_require__(4);
	const globals_node_js_1 = __webpack_require__(3);
	const has_cors_js_1 = __webpack_require__(38);
	const debug_1 = __importDefault(__webpack_require__(5)); // debug()
	const debug = (0, debug_1.default)("engine.io-client:polling"); // debug()
	function empty() { }
	class BaseXHR extends polling_js_1.Polling {
	    /**
	     * XHR Polling constructor.
	     *
	     * @param {Object} opts
	     * @package
	     */
	    constructor(opts) {
	        super(opts);
	        if (typeof location !== "undefined") {
	            const isSSL = "https:" === location.protocol;
	            let port = location.port;
	            // some user agents have empty `location.port`
	            if (!port) {
	                port = isSSL ? "443" : "80";
	            }
	            this.xd =
	                (typeof location !== "undefined" &&
	                    opts.hostname !== location.hostname) ||
	                    port !== opts.port;
	        }
	    }
	    /**
	     * Sends data.
	     *
	     * @param {String} data to send.
	     * @param {Function} called upon flush.
	     * @private
	     */
	    doWrite(data, fn) {
	        const req = this.request({
	            method: "POST",
	            data: data,
	        });
	        req.on("success", fn);
	        req.on("error", (xhrStatus, context) => {
	            this.onError("xhr post error", xhrStatus, context);
	        });
	    }
	    /**
	     * Starts a poll cycle.
	     *
	     * @private
	     */
	    doPoll() {
	        debug("xhr poll");
	        const req = this.request();
	        req.on("data", this.onData.bind(this));
	        req.on("error", (xhrStatus, context) => {
	            this.onError("xhr poll error", xhrStatus, context);
	        });
	        this.pollXhr = req;
	    }
	}
	exports.BaseXHR = BaseXHR;
	class Request extends component_emitter_1.Emitter {
	    /**
	     * Request constructor
	     *
	     * @param {Object} options
	     * @package
	     */
	    constructor(createRequest, uri, opts) {
	        super();
	        this.createRequest = createRequest;
	        (0, util_js_1.installTimerFunctions)(this, opts);
	        this._opts = opts;
	        this._method = opts.method || "GET";
	        this._uri = uri;
	        this._data = undefined !== opts.data ? opts.data : null;
	        this._create();
	    }
	    /**
	     * Creates the XHR object and sends the request.
	     *
	     * @private
	     */
	    _create() {
	        var _a;
	        const opts = (0, util_js_1.pick)(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
	        opts.xdomain = !!this._opts.xd;
	        const xhr = (this._xhr = this.createRequest(opts));
	        try {
	            debug("xhr open %s: %s", this._method, this._uri);
	            xhr.open(this._method, this._uri, true);
	            try {
	                if (this._opts.extraHeaders) {
	                    // @ts-ignore
	                    xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
	                    for (let i in this._opts.extraHeaders) {
	                        if (this._opts.extraHeaders.hasOwnProperty(i)) {
	                            xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
	                        }
	                    }
	                }
	            }
	            catch (e) { }
	            if ("POST" === this._method) {
	                try {
	                    xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
	                }
	                catch (e) { }
	            }
	            try {
	                xhr.setRequestHeader("Accept", "*/*");
	            }
	            catch (e) { }
	            (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
	            // ie6 check
	            if ("withCredentials" in xhr) {
	                xhr.withCredentials = this._opts.withCredentials;
	            }
	            if (this._opts.requestTimeout) {
	                xhr.timeout = this._opts.requestTimeout;
	            }
	            xhr.onreadystatechange = () => {
	                var _a;
	                if (xhr.readyState === 3) {
	                    (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.parseCookies(
	                    // @ts-ignore
	                    xhr.getResponseHeader("set-cookie"));
	                }
	                if (4 !== xhr.readyState)
	                    return;
	                if (200 === xhr.status || 1223 === xhr.status) {
	                    this._onLoad();
	                }
	                else {
	                    // make sure the `error` event handler that's user-set
	                    // does not throw in the same tick and gets caught here
	                    this.setTimeoutFn(() => {
	                        this._onError(typeof xhr.status === "number" ? xhr.status : 0);
	                    }, 0);
	                }
	            };
	            debug("xhr data %s", this._data);
	            xhr.send(this._data);
	        }
	        catch (e) {
	            // Need to defer since .create() is called directly from the constructor
	            // and thus the 'error' event can only be only bound *after* this exception
	            // occurs.  Therefore, also, we cannot throw here at all.
	            this.setTimeoutFn(() => {
	                this._onError(e);
	            }, 0);
	            return;
	        }
	        if (typeof document !== "undefined") {
	            this._index = Request.requestsCount++;
	            Request.requests[this._index] = this;
	        }
	    }
	    /**
	     * Called upon error.
	     *
	     * @private
	     */
	    _onError(err) {
	        this.emitReserved("error", err, this._xhr);
	        this._cleanup(true);
	    }
	    /**
	     * Cleans up house.
	     *
	     * @private
	     */
	    _cleanup(fromError) {
	        if ("undefined" === typeof this._xhr || null === this._xhr) {
	            return;
	        }
	        this._xhr.onreadystatechange = empty;
	        if (fromError) {
	            try {
	                this._xhr.abort();
	            }
	            catch (e) { }
	        }
	        if (typeof document !== "undefined") {
	            delete Request.requests[this._index];
	        }
	        this._xhr = null;
	    }
	    /**
	     * Called upon load.
	     *
	     * @private
	     */
	    _onLoad() {
	        const data = this._xhr.responseText;
	        if (data !== null) {
	            this.emitReserved("data", data);
	            this.emitReserved("success");
	            this._cleanup();
	        }
	    }
	    /**
	     * Aborts the request.
	     *
	     * @package
	     */
	    abort() {
	        this._cleanup();
	    }
	}
	exports.Request = Request;
	Request.requestsCount = 0;
	Request.requests = {};
	/**
	 * Aborts pending requests when unloading the window. This is needed to prevent
	 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
	 * emitted.
	 */
	if (typeof document !== "undefined") {
	    // @ts-ignore
	    if (typeof attachEvent === "function") {
	        // @ts-ignore
	        attachEvent("onunload", unloadHandler);
	    }
	    else if (typeof addEventListener === "function") {
	        const terminationEvent = "onpagehide" in globals_node_js_1.globalThisShim ? "pagehide" : "unload";
	        addEventListener(terminationEvent, unloadHandler, false);
	    }
	}
	function unloadHandler() {
	    for (let i in Request.requests) {
	        if (Request.requests.hasOwnProperty(i)) {
	            Request.requests[i].abort();
	        }
	    }
	}
	const hasXHR2 = (function () {
	    const xhr = newRequest({
	        xdomain: false,
	    });
	    return xhr && xhr.responseType !== null;
	})();
	/**
	 * HTTP long-polling based on the built-in `XMLHttpRequest` object.
	 *
	 * Usage: browser
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
	 */
	class XHR extends BaseXHR {
	    constructor(opts) {
	        super(opts);
	        const forceBase64 = opts && opts.forceBase64;
	        this.supportsBinary = hasXHR2 && !forceBase64;
	    }
	    request(opts = {}) {
	        Object.assign(opts, { xd: this.xd }, this.opts);
	        return new Request(newRequest, this.uri(), opts);
	    }
	}
	exports.XHR = XHR;
	function newRequest(opts) {
	    const xdomain = opts.xdomain;
	    // XMLHttpRequest can be disabled on IE
	    try {
	        if ("undefined" !== typeof XMLHttpRequest && (!xdomain || has_cors_js_1.hasCORS)) {
	            return new XMLHttpRequest();
	        }
	    }
	    catch (e) { }
	    if (!xdomain) {
	        try {
	            return new globals_node_js_1.globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
	        }
	        catch (e) { }
	    }
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WS = exports.BaseWS = void 0;
	const transport_js_1 = __webpack_require__(7);
	const util_js_1 = __webpack_require__(4);
	const engine_io_parser_1 = __webpack_require__(6);
	const globals_node_js_1 = __webpack_require__(3);
	const debug_1 = __importDefault(__webpack_require__(5)); // debug()
	const debug = (0, debug_1.default)("engine.io-client:websocket"); // debug()
	// detect ReactNative environment
	const isReactNative = typeof navigator !== "undefined" &&
	    typeof navigator.product === "string" &&
	    navigator.product.toLowerCase() === "reactnative";
	class BaseWS extends transport_js_1.Transport {
	    get name() {
	        return "websocket";
	    }
	    doOpen() {
	        const uri = this.uri();
	        const protocols = this.opts.protocols;
	        // React Native only supports the 'headers' option, and will print a warning if anything else is passed
	        const opts = isReactNative
	            ? {}
	            : (0, util_js_1.pick)(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
	        if (this.opts.extraHeaders) {
	            opts.headers = this.opts.extraHeaders;
	        }
	        try {
	            this.ws = this.createSocket(uri, protocols, opts);
	        }
	        catch (err) {
	            return this.emitReserved("error", err);
	        }
	        this.ws.binaryType = this.socket.binaryType;
	        this.addEventListeners();
	    }
	    /**
	     * Adds event listeners to the socket
	     *
	     * @private
	     */
	    addEventListeners() {
	        this.ws.onopen = () => {
	            if (this.opts.autoUnref) {
	                this.ws._socket.unref();
	            }
	            this.onOpen();
	        };
	        this.ws.onclose = (closeEvent) => this.onClose({
	            description: "websocket connection closed",
	            context: closeEvent,
	        });
	        this.ws.onmessage = (ev) => this.onData(ev.data);
	        this.ws.onerror = (e) => this.onError("websocket error", e);
	    }
	    write(packets) {
	        this.writable = false;
	        // encodePacket efficient as it uses WS framing
	        // no need for encodePayload
	        for (let i = 0; i < packets.length; i++) {
	            const packet = packets[i];
	            const lastPacket = i === packets.length - 1;
	            (0, engine_io_parser_1.encodePacket)(packet, this.supportsBinary, (data) => {
	                // Sometimes the websocket has already been closed but the browser didn't
	                // have a chance of informing us about it yet, in that case send will
	                // throw an error
	                try {
	                    this.doWrite(packet, data);
	                }
	                catch (e) {
	                    debug("websocket closed before onclose event");
	                }
	                if (lastPacket) {
	                    // fake drain
	                    // defer to next tick to allow Socket to clear writeBuffer
	                    (0, globals_node_js_1.nextTick)(() => {
	                        this.writable = true;
	                        this.emitReserved("drain");
	                    }, this.setTimeoutFn);
	                }
	            });
	        }
	    }
	    doClose() {
	        if (typeof this.ws !== "undefined") {
	            this.ws.onerror = () => { };
	            this.ws.close();
	            this.ws = null;
	        }
	    }
	    /**
	     * Generates uri for connection.
	     *
	     * @private
	     */
	    uri() {
	        const schema = this.opts.secure ? "wss" : "ws";
	        const query = this.query || {};
	        // append timestamp to URI
	        if (this.opts.timestampRequests) {
	            query[this.opts.timestampParam] = (0, util_js_1.randomString)();
	        }
	        // communicate binary support capabilities
	        if (!this.supportsBinary) {
	            query.b64 = 1;
	        }
	        return this.createUri(schema, query);
	    }
	}
	exports.BaseWS = BaseWS;
	const WebSocketCtor = globals_node_js_1.globalThisShim.WebSocket || globals_node_js_1.globalThisShim.MozWebSocket;
	/**
	 * WebSocket transport based on the built-in `WebSocket` object.
	 *
	 * Usage: browser, Node.js (since v21), Deno, Bun
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
	 * @see https://caniuse.com/mdn-api_websocket
	 * @see https://nodejs.org/api/globals.html#websocket
	 */
	class WS extends BaseWS {
	    createSocket(uri, protocols, opts) {
	        return !isReactNative
	            ? protocols
	                ? new WebSocketCtor(uri, protocols)
	                : new WebSocketCtor(uri)
	            : new WebSocketCtor(uri, protocols, opts);
	    }
	    doWrite(_packet, data) {
	        this.ws.send(data);
	    }
	}
	exports.WS = WS;


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ERROR_PACKET = exports.PACKET_TYPES_REVERSE = exports.PACKET_TYPES = void 0;
	const PACKET_TYPES = Object.create(null); // no Map = no polyfill
	exports.PACKET_TYPES = PACKET_TYPES;
	PACKET_TYPES["open"] = "0";
	PACKET_TYPES["close"] = "1";
	PACKET_TYPES["ping"] = "2";
	PACKET_TYPES["pong"] = "3";
	PACKET_TYPES["message"] = "4";
	PACKET_TYPES["upgrade"] = "5";
	PACKET_TYPES["noop"] = "6";
	const PACKET_TYPES_REVERSE = Object.create(null);
	exports.PACKET_TYPES_REVERSE = PACKET_TYPES_REVERSE;
	Object.keys(PACKET_TYPES).forEach((key) => {
	    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
	});
	const ERROR_PACKET = { type: "error", data: "parser error" };
	exports.ERROR_PACKET = ERROR_PACKET;


/***/ }),
/* 13 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Decoder = exports.Encoder = exports.PacketType = exports.protocol = void 0;
	const component_emitter_1 = __webpack_require__(2);
	const binary_js_1 = __webpack_require__(56);
	const is_binary_js_1 = __webpack_require__(24);
	const debug_1 = __webpack_require__(57); // debug()
	const debug = (0, debug_1.default)("socket.io-parser"); // debug()
	/**
	 * These strings must not be used as event names, as they have a special meaning.
	 */
	const RESERVED_EVENTS = [
	    "connect",
	    "connect_error",
	    "disconnect",
	    "disconnecting",
	    "newListener",
	    "removeListener", // used by the Node.js EventEmitter
	];
	/**
	 * Protocol version.
	 *
	 * @public
	 */
	exports.protocol = 5;
	var PacketType;
	(function (PacketType) {
	    PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
	    PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
	    PacketType[PacketType["EVENT"] = 2] = "EVENT";
	    PacketType[PacketType["ACK"] = 3] = "ACK";
	    PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
	    PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
	    PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
	})(PacketType = exports.PacketType || (exports.PacketType = {}));
	/**
	 * A socket.io Encoder instance
	 */
	class Encoder {
	    /**
	     * Encoder constructor
	     *
	     * @param {function} replacer - custom replacer to pass down to JSON.parse
	     */
	    constructor(replacer) {
	        this.replacer = replacer;
	    }
	    /**
	     * Encode a packet as a single string if non-binary, or as a
	     * buffer sequence, depending on packet type.
	     *
	     * @param {Object} obj - packet object
	     */
	    encode(obj) {
	        debug("encoding packet %j", obj);
	        if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
	            if ((0, is_binary_js_1.hasBinary)(obj)) {
	                return this.encodeAsBinary({
	                    type: obj.type === PacketType.EVENT
	                        ? PacketType.BINARY_EVENT
	                        : PacketType.BINARY_ACK,
	                    nsp: obj.nsp,
	                    data: obj.data,
	                    id: obj.id,
	                });
	            }
	        }
	        return [this.encodeAsString(obj)];
	    }
	    /**
	     * Encode packet as string.
	     */
	    encodeAsString(obj) {
	        // first is type
	        let str = "" + obj.type;
	        // attachments if we have them
	        if (obj.type === PacketType.BINARY_EVENT ||
	            obj.type === PacketType.BINARY_ACK) {
	            str += obj.attachments + "-";
	        }
	        // if we have a namespace other than `/`
	        // we append it followed by a comma `,`
	        if (obj.nsp && "/" !== obj.nsp) {
	            str += obj.nsp + ",";
	        }
	        // immediately followed by the id
	        if (null != obj.id) {
	            str += obj.id;
	        }
	        // json data
	        if (null != obj.data) {
	            str += JSON.stringify(obj.data, this.replacer);
	        }
	        debug("encoded %j as %s", obj, str);
	        return str;
	    }
	    /**
	     * Encode packet as 'buffer sequence' by removing blobs, and
	     * deconstructing packet into object with placeholders and
	     * a list of buffers.
	     */
	    encodeAsBinary(obj) {
	        const deconstruction = (0, binary_js_1.deconstructPacket)(obj);
	        const pack = this.encodeAsString(deconstruction.packet);
	        const buffers = deconstruction.buffers;
	        buffers.unshift(pack); // add packet info to beginning of data list
	        return buffers; // write all the buffers
	    }
	}
	exports.Encoder = Encoder;
	// see https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
	function isObject(value) {
	    return Object.prototype.toString.call(value) === "[object Object]";
	}
	/**
	 * A socket.io Decoder instance
	 *
	 * @return {Object} decoder
	 */
	class Decoder extends component_emitter_1.Emitter {
	    /**
	     * Decoder constructor
	     *
	     * @param {function} reviver - custom reviver to pass down to JSON.stringify
	     */
	    constructor(reviver) {
	        super();
	        this.reviver = reviver;
	    }
	    /**
	     * Decodes an encoded packet string into packet JSON.
	     *
	     * @param {String} obj - encoded packet
	     */
	    add(obj) {
	        let packet;
	        if (typeof obj === "string") {
	            if (this.reconstructor) {
	                throw new Error("got plaintext data when reconstructing a packet");
	            }
	            packet = this.decodeString(obj);
	            const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
	            if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
	                packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
	                // binary packet's json
	                this.reconstructor = new BinaryReconstructor(packet);
	                // no attachments, labeled binary but no binary data to follow
	                if (packet.attachments === 0) {
	                    super.emitReserved("decoded", packet);
	                }
	            }
	            else {
	                // non-binary full packet
	                super.emitReserved("decoded", packet);
	            }
	        }
	        else if ((0, is_binary_js_1.isBinary)(obj) || obj.base64) {
	            // raw binary data
	            if (!this.reconstructor) {
	                throw new Error("got binary data when not reconstructing a packet");
	            }
	            else {
	                packet = this.reconstructor.takeBinaryData(obj);
	                if (packet) {
	                    // received final buffer
	                    this.reconstructor = null;
	                    super.emitReserved("decoded", packet);
	                }
	            }
	        }
	        else {
	            throw new Error("Unknown type: " + obj);
	        }
	    }
	    /**
	     * Decode a packet String (JSON data)
	     *
	     * @param {String} str
	     * @return {Object} packet
	     */
	    decodeString(str) {
	        let i = 0;
	        // look up type
	        const p = {
	            type: Number(str.charAt(0)),
	        };
	        if (PacketType[p.type] === undefined) {
	            throw new Error("unknown packet type " + p.type);
	        }
	        // look up attachments if type binary
	        if (p.type === PacketType.BINARY_EVENT ||
	            p.type === PacketType.BINARY_ACK) {
	            const start = i + 1;
	            while (str.charAt(++i) !== "-" && i != str.length) { }
	            const buf = str.substring(start, i);
	            if (buf != Number(buf) || str.charAt(i) !== "-") {
	                throw new Error("Illegal attachments");
	            }
	            p.attachments = Number(buf);
	        }
	        // look up namespace (if any)
	        if ("/" === str.charAt(i + 1)) {
	            const start = i + 1;
	            while (++i) {
	                const c = str.charAt(i);
	                if ("," === c)
	                    break;
	                if (i === str.length)
	                    break;
	            }
	            p.nsp = str.substring(start, i);
	        }
	        else {
	            p.nsp = "/";
	        }
	        // look up id
	        const next = str.charAt(i + 1);
	        if ("" !== next && Number(next) == next) {
	            const start = i + 1;
	            while (++i) {
	                const c = str.charAt(i);
	                if (null == c || Number(c) != c) {
	                    --i;
	                    break;
	                }
	                if (i === str.length)
	                    break;
	            }
	            p.id = Number(str.substring(start, i + 1));
	        }
	        // look up json data
	        if (str.charAt(++i)) {
	            const payload = this.tryParse(str.substr(i));
	            if (Decoder.isPayloadValid(p.type, payload)) {
	                p.data = payload;
	            }
	            else {
	                throw new Error("invalid payload");
	            }
	        }
	        debug("decoded %s as %j", str, p);
	        return p;
	    }
	    tryParse(str) {
	        try {
	            return JSON.parse(str, this.reviver);
	        }
	        catch (e) {
	            return false;
	        }
	    }
	    static isPayloadValid(type, payload) {
	        switch (type) {
	            case PacketType.CONNECT:
	                return isObject(payload);
	            case PacketType.DISCONNECT:
	                return payload === undefined;
	            case PacketType.CONNECT_ERROR:
	                return typeof payload === "string" || isObject(payload);
	            case PacketType.EVENT:
	            case PacketType.BINARY_EVENT:
	                return (Array.isArray(payload) &&
	                    (typeof payload[0] === "number" ||
	                        (typeof payload[0] === "string" &&
	                            RESERVED_EVENTS.indexOf(payload[0]) === -1)));
	            case PacketType.ACK:
	            case PacketType.BINARY_ACK:
	                return Array.isArray(payload);
	        }
	    }
	    /**
	     * Deallocates a parser's resources
	     */
	    destroy() {
	        if (this.reconstructor) {
	            this.reconstructor.finishedReconstruction();
	            this.reconstructor = null;
	        }
	    }
	}
	exports.Decoder = Decoder;
	/**
	 * A manager of a binary event's 'buffer sequence'. Should
	 * be constructed whenever a packet of type BINARY_EVENT is
	 * decoded.
	 *
	 * @param {Object} packet
	 * @return {BinaryReconstructor} initialized reconstructor
	 */
	class BinaryReconstructor {
	    constructor(packet) {
	        this.packet = packet;
	        this.buffers = [];
	        this.reconPack = packet;
	    }
	    /**
	     * Method to be called when binary data received from connection
	     * after a BINARY_EVENT packet.
	     *
	     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
	     * @return {null | Object} returns null if more binary data is expected or
	     *   a reconstructed packet object if all buffers have been received.
	     */
	    takeBinaryData(binData) {
	        this.buffers.push(binData);
	        if (this.buffers.length === this.reconPack.attachments) {
	            // done with buffer list
	            const packet = (0, binary_js_1.reconstructPacket)(this.reconPack, this.buffers);
	            this.finishedReconstruction();
	            return packet;
	        }
	        return null;
	    }
	    /**
	     * Cleans up binary packet reconstruction variables.
	     */
	    finishedReconstruction() {
	        this.reconPack = null;
	        this.buffers = [];
	    }
	}


/***/ }),
/* 15 */,
/* 16 */
/***/ (function(module, exports) {

	"use strict";
	// imported from https://github.com/galkn/querystring
	/**
	 * Compiles a querystring
	 * Returns string representation of the object
	 *
	 * @param {Object}
	 * @api private
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encode = encode;
	exports.decode = decode;
	function encode(obj) {
	    let str = '';
	    for (let i in obj) {
	        if (obj.hasOwnProperty(i)) {
	            if (str.length)
	                str += '&';
	            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
	        }
	    }
	    return str;
	}
	/**
	 * Parses a simple querystring into an object
	 *
	 * @param {String} qs
	 * @api private
	 */
	function decode(qs) {
	    let qry = {};
	    let pairs = qs.split('&');
	    for (let i = 0, l = pairs.length; i < l; i++) {
	        let pair = pairs[i].split('=');
	        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	    }
	    return qry;
	}


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parse = parse;
	// imported from https://github.com/galkn/parseuri
	/**
	 * Parses a URI
	 *
	 * Note: we could also have used the built-in URL object, but it isn't supported on all platforms.
	 *
	 * See:
	 * - https://developer.mozilla.org/en-US/docs/Web/API/URL
	 * - https://caniuse.com/url
	 * - https://www.rfc-editor.org/rfc/rfc3986#appendix-B
	 *
	 * History of the parse() method:
	 * - first commit: https://github.com/socketio/socket.io-client/commit/4ee1d5d94b3906a9c052b459f1a818b15f38f91c
	 * - export into its own module: https://github.com/socketio/engine.io-client/commit/de2c561e4564efeb78f1bdb1ba39ef81b2822cb3
	 * - reimport: https://github.com/socketio/engine.io-client/commit/df32277c3f6d622eec5ed09f493cae3f3391d242
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */
	const re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	const parts = [
	    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
	];
	function parse(str) {
	    if (str.length > 8000) {
	        throw "URI too long";
	    }
	    const src = str, b = str.indexOf('['), e = str.indexOf(']');
	    if (b != -1 && e != -1) {
	        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
	    }
	    let m = re.exec(str || ''), uri = {}, i = 14;
	    while (i--) {
	        uri[parts[i]] = m[i] || '';
	    }
	    if (b != -1 && e != -1) {
	        uri.source = src;
	        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
	        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
	        uri.ipv6uri = true;
	    }
	    uri.pathNames = pathNames(uri, uri['path']);
	    uri.queryKey = queryKey(uri, uri['query']);
	    return uri;
	}
	function pathNames(obj, path) {
	    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
	    if (path.slice(0, 1) == '/' || path.length === 0) {
	        names.splice(0, 1);
	    }
	    if (path.slice(-1) == '/') {
	        names.splice(names.length - 1, 1);
	    }
	    return names;
	}
	function queryKey(uri, query) {
	    const data = {};
	    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
	        if ($1) {
	            data[$1] = $2;
	        }
	    });
	    return data;
	}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Socket = exports.SocketWithUpgrade = exports.SocketWithoutUpgrade = void 0;
	const index_js_1 = __webpack_require__(19);
	const util_js_1 = __webpack_require__(4);
	const parseqs_js_1 = __webpack_require__(16);
	const parseuri_js_1 = __webpack_require__(17);
	const component_emitter_1 = __webpack_require__(2);
	const engine_io_parser_1 = __webpack_require__(6);
	const globals_node_js_1 = __webpack_require__(3);
	const debug_1 = __importDefault(__webpack_require__(5)); // debug()
	const debug = (0, debug_1.default)("engine.io-client:socket"); // debug()
	const withEventListeners = typeof addEventListener === "function" &&
	    typeof removeEventListener === "function";
	const OFFLINE_EVENT_LISTENERS = [];
	if (withEventListeners) {
	    // within a ServiceWorker, any event handler for the 'offline' event must be added on the initial evaluation of the
	    // script, so we create one single event listener here which will forward the event to the socket instances
	    addEventListener("offline", () => {
	        debug("closing %d connection(s) because the network was lost", OFFLINE_EVENT_LISTENERS.length);
	        OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
	    }, false);
	}
	/**
	 * This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
	 * with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
	 *
	 * This class comes without upgrade mechanism, which means that it will keep the first low-level transport that
	 * successfully establishes the connection.
	 *
	 * In order to allow tree-shaking, there are no transports included, that's why the `transports` option is mandatory.
	 *
	 * @example
	 * import { SocketWithoutUpgrade, WebSocket } from "engine.io-client";
	 *
	 * const socket = new SocketWithoutUpgrade({
	 *   transports: [WebSocket]
	 * });
	 *
	 * socket.on("open", () => {
	 *   socket.send("hello");
	 * });
	 *
	 * @see SocketWithUpgrade
	 * @see Socket
	 */
	class SocketWithoutUpgrade extends component_emitter_1.Emitter {
	    /**
	     * Socket constructor.
	     *
	     * @param {String|Object} uri - uri or options
	     * @param {Object} opts - options
	     */
	    constructor(uri, opts) {
	        super();
	        this.binaryType = globals_node_js_1.defaultBinaryType;
	        this.writeBuffer = [];
	        this._prevBufferLen = 0;
	        this._pingInterval = -1;
	        this._pingTimeout = -1;
	        this._maxPayload = -1;
	        /**
	         * The expiration timestamp of the {@link _pingTimeoutTimer} object is tracked, in case the timer is throttled and the
	         * callback is not fired on time. This can happen for example when a laptop is suspended or when a phone is locked.
	         */
	        this._pingTimeoutTime = Infinity;
	        if (uri && "object" === typeof uri) {
	            opts = uri;
	            uri = null;
	        }
	        if (uri) {
	            const parsedUri = (0, parseuri_js_1.parse)(uri);
	            opts.hostname = parsedUri.host;
	            opts.secure =
	                parsedUri.protocol === "https" || parsedUri.protocol === "wss";
	            opts.port = parsedUri.port;
	            if (parsedUri.query)
	                opts.query = parsedUri.query;
	        }
	        else if (opts.host) {
	            opts.hostname = (0, parseuri_js_1.parse)(opts.host).host;
	        }
	        (0, util_js_1.installTimerFunctions)(this, opts);
	        this.secure =
	            null != opts.secure
	                ? opts.secure
	                : typeof location !== "undefined" && "https:" === location.protocol;
	        if (opts.hostname && !opts.port) {
	            // if no port is specified manually, use the protocol default
	            opts.port = this.secure ? "443" : "80";
	        }
	        this.hostname =
	            opts.hostname ||
	                (typeof location !== "undefined" ? location.hostname : "localhost");
	        this.port =
	            opts.port ||
	                (typeof location !== "undefined" && location.port
	                    ? location.port
	                    : this.secure
	                        ? "443"
	                        : "80");
	        this.transports = [];
	        this._transportsByName = {};
	        opts.transports.forEach((t) => {
	            const transportName = t.prototype.name;
	            this.transports.push(transportName);
	            this._transportsByName[transportName] = t;
	        });
	        this.opts = Object.assign({
	            path: "/engine.io",
	            agent: false,
	            withCredentials: false,
	            upgrade: true,
	            timestampParam: "t",
	            rememberUpgrade: false,
	            addTrailingSlash: true,
	            rejectUnauthorized: true,
	            perMessageDeflate: {
	                threshold: 1024,
	            },
	            transportOptions: {},
	            closeOnBeforeunload: false,
	        }, opts);
	        this.opts.path =
	            this.opts.path.replace(/\/$/, "") +
	                (this.opts.addTrailingSlash ? "/" : "");
	        if (typeof this.opts.query === "string") {
	            this.opts.query = (0, parseqs_js_1.decode)(this.opts.query);
	        }
	        if (withEventListeners) {
	            if (this.opts.closeOnBeforeunload) {
	                // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
	                // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
	                // closed/reloaded)
	                this._beforeunloadEventListener = () => {
	                    if (this.transport) {
	                        // silently close the transport
	                        this.transport.removeAllListeners();
	                        this.transport.close();
	                    }
	                };
	                addEventListener("beforeunload", this._beforeunloadEventListener, false);
	            }
	            if (this.hostname !== "localhost") {
	                debug("adding listener for the 'offline' event");
	                this._offlineEventListener = () => {
	                    this._onClose("transport close", {
	                        description: "network connection lost",
	                    });
	                };
	                OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
	            }
	        }
	        if (this.opts.withCredentials) {
	            this._cookieJar = (0, globals_node_js_1.createCookieJar)();
	        }
	        this._open();
	    }
	    /**
	     * Creates transport of the given type.
	     *
	     * @param {String} name - transport name
	     * @return {Transport}
	     * @private
	     */
	    createTransport(name) {
	        debug('creating transport "%s"', name);
	        const query = Object.assign({}, this.opts.query);
	        // append engine.io protocol identifier
	        query.EIO = engine_io_parser_1.protocol;
	        // transport name
	        query.transport = name;
	        // session id if we already have one
	        if (this.id)
	            query.sid = this.id;
	        const opts = Object.assign({}, this.opts, {
	            query,
	            socket: this,
	            hostname: this.hostname,
	            secure: this.secure,
	            port: this.port,
	        }, this.opts.transportOptions[name]);
	        debug("options: %j", opts);
	        return new this._transportsByName[name](opts);
	    }
	    /**
	     * Initializes transport to use and starts probe.
	     *
	     * @private
	     */
	    _open() {
	        if (this.transports.length === 0) {
	            // Emit error on next tick so it can be listened to
	            this.setTimeoutFn(() => {
	                this.emitReserved("error", "No transports available");
	            }, 0);
	            return;
	        }
	        const transportName = this.opts.rememberUpgrade &&
	            SocketWithoutUpgrade.priorWebsocketSuccess &&
	            this.transports.indexOf("websocket") !== -1
	            ? "websocket"
	            : this.transports[0];
	        this.readyState = "opening";
	        const transport = this.createTransport(transportName);
	        transport.open();
	        this.setTransport(transport);
	    }
	    /**
	     * Sets the current transport. Disables the existing one (if any).
	     *
	     * @private
	     */
	    setTransport(transport) {
	        debug("setting transport %s", transport.name);
	        if (this.transport) {
	            debug("clearing existing transport %s", this.transport.name);
	            this.transport.removeAllListeners();
	        }
	        // set up transport
	        this.transport = transport;
	        // set up transport listeners
	        transport
	            .on("drain", this._onDrain.bind(this))
	            .on("packet", this._onPacket.bind(this))
	            .on("error", this._onError.bind(this))
	            .on("close", (reason) => this._onClose("transport close", reason));
	    }
	    /**
	     * Called when connection is deemed open.
	     *
	     * @private
	     */
	    onOpen() {
	        debug("socket open");
	        this.readyState = "open";
	        SocketWithoutUpgrade.priorWebsocketSuccess =
	            "websocket" === this.transport.name;
	        this.emitReserved("open");
	        this.flush();
	    }
	    /**
	     * Handles a packet.
	     *
	     * @private
	     */
	    _onPacket(packet) {
	        if ("opening" === this.readyState ||
	            "open" === this.readyState ||
	            "closing" === this.readyState) {
	            debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
	            this.emitReserved("packet", packet);
	            // Socket is live - any packet counts
	            this.emitReserved("heartbeat");
	            switch (packet.type) {
	                case "open":
	                    this.onHandshake(JSON.parse(packet.data));
	                    break;
	                case "ping":
	                    this._sendPacket("pong");
	                    this.emitReserved("ping");
	                    this.emitReserved("pong");
	                    this._resetPingTimeout();
	                    break;
	                case "error":
	                    const err = new Error("server error");
	                    // @ts-ignore
	                    err.code = packet.data;
	                    this._onError(err);
	                    break;
	                case "message":
	                    this.emitReserved("data", packet.data);
	                    this.emitReserved("message", packet.data);
	                    break;
	            }
	        }
	        else {
	            debug('packet received with socket readyState "%s"', this.readyState);
	        }
	    }
	    /**
	     * Called upon handshake completion.
	     *
	     * @param {Object} data - handshake obj
	     * @private
	     */
	    onHandshake(data) {
	        this.emitReserved("handshake", data);
	        this.id = data.sid;
	        this.transport.query.sid = data.sid;
	        this._pingInterval = data.pingInterval;
	        this._pingTimeout = data.pingTimeout;
	        this._maxPayload = data.maxPayload;
	        this.onOpen();
	        // In case open handler closes socket
	        if ("closed" === this.readyState)
	            return;
	        this._resetPingTimeout();
	    }
	    /**
	     * Sets and resets ping timeout timer based on server pings.
	     *
	     * @private
	     */
	    _resetPingTimeout() {
	        this.clearTimeoutFn(this._pingTimeoutTimer);
	        const delay = this._pingInterval + this._pingTimeout;
	        this._pingTimeoutTime = Date.now() + delay;
	        this._pingTimeoutTimer = this.setTimeoutFn(() => {
	            this._onClose("ping timeout");
	        }, delay);
	        if (this.opts.autoUnref) {
	            this._pingTimeoutTimer.unref();
	        }
	    }
	    /**
	     * Called on `drain` event
	     *
	     * @private
	     */
	    _onDrain() {
	        this.writeBuffer.splice(0, this._prevBufferLen);
	        // setting prevBufferLen = 0 is very important
	        // for example, when upgrading, upgrade packet is sent over,
	        // and a nonzero prevBufferLen could cause problems on `drain`
	        this._prevBufferLen = 0;
	        if (0 === this.writeBuffer.length) {
	            this.emitReserved("drain");
	        }
	        else {
	            this.flush();
	        }
	    }
	    /**
	     * Flush write buffers.
	     *
	     * @private
	     */
	    flush() {
	        if ("closed" !== this.readyState &&
	            this.transport.writable &&
	            !this.upgrading &&
	            this.writeBuffer.length) {
	            const packets = this._getWritablePackets();
	            debug("flushing %d packets in socket", packets.length);
	            this.transport.send(packets);
	            // keep track of current length of writeBuffer
	            // splice writeBuffer and callbackBuffer on `drain`
	            this._prevBufferLen = packets.length;
	            this.emitReserved("flush");
	        }
	    }
	    /**
	     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
	     * long-polling)
	     *
	     * @private
	     */
	    _getWritablePackets() {
	        const shouldCheckPayloadSize = this._maxPayload &&
	            this.transport.name === "polling" &&
	            this.writeBuffer.length > 1;
	        if (!shouldCheckPayloadSize) {
	            return this.writeBuffer;
	        }
	        let payloadSize = 1; // first packet type
	        for (let i = 0; i < this.writeBuffer.length; i++) {
	            const data = this.writeBuffer[i].data;
	            if (data) {
	                payloadSize += (0, util_js_1.byteLength)(data);
	            }
	            if (i > 0 && payloadSize > this._maxPayload) {
	                debug("only send %d out of %d packets", i, this.writeBuffer.length);
	                return this.writeBuffer.slice(0, i);
	            }
	            payloadSize += 2; // separator + packet type
	        }
	        debug("payload size is %d (max: %d)", payloadSize, this._maxPayload);
	        return this.writeBuffer;
	    }
	    /**
	     * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
	     *
	     * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
	     * `write()` method then the message would not be buffered by the Socket.IO client.
	     *
	     * @return {boolean}
	     * @private
	     */
	    /* private */ _hasPingExpired() {
	        if (!this._pingTimeoutTime)
	            return true;
	        const hasExpired = Date.now() > this._pingTimeoutTime;
	        if (hasExpired) {
	            debug("throttled timer detected, scheduling connection close");
	            this._pingTimeoutTime = 0;
	            (0, globals_node_js_1.nextTick)(() => {
	                this._onClose("ping timeout");
	            }, this.setTimeoutFn);
	        }
	        return hasExpired;
	    }
	    /**
	     * Sends a message.
	     *
	     * @param {String} msg - message.
	     * @param {Object} options.
	     * @param {Function} fn - callback function.
	     * @return {Socket} for chaining.
	     */
	    write(msg, options, fn) {
	        this._sendPacket("message", msg, options, fn);
	        return this;
	    }
	    /**
	     * Sends a message. Alias of {@link Socket#write}.
	     *
	     * @param {String} msg - message.
	     * @param {Object} options.
	     * @param {Function} fn - callback function.
	     * @return {Socket} for chaining.
	     */
	    send(msg, options, fn) {
	        this._sendPacket("message", msg, options, fn);
	        return this;
	    }
	    /**
	     * Sends a packet.
	     *
	     * @param {String} type: packet type.
	     * @param {String} data.
	     * @param {Object} options.
	     * @param {Function} fn - callback function.
	     * @private
	     */
	    _sendPacket(type, data, options, fn) {
	        if ("function" === typeof data) {
	            fn = data;
	            data = undefined;
	        }
	        if ("function" === typeof options) {
	            fn = options;
	            options = null;
	        }
	        if ("closing" === this.readyState || "closed" === this.readyState) {
	            return;
	        }
	        options = options || {};
	        options.compress = false !== options.compress;
	        const packet = {
	            type: type,
	            data: data,
	            options: options,
	        };
	        this.emitReserved("packetCreate", packet);
	        this.writeBuffer.push(packet);
	        if (fn)
	            this.once("flush", fn);
	        this.flush();
	    }
	    /**
	     * Closes the connection.
	     */
	    close() {
	        const close = () => {
	            this._onClose("forced close");
	            debug("socket closing - telling transport to close");
	            this.transport.close();
	        };
	        const cleanupAndClose = () => {
	            this.off("upgrade", cleanupAndClose);
	            this.off("upgradeError", cleanupAndClose);
	            close();
	        };
	        const waitForUpgrade = () => {
	            // wait for upgrade to finish since we can't send packets while pausing a transport
	            this.once("upgrade", cleanupAndClose);
	            this.once("upgradeError", cleanupAndClose);
	        };
	        if ("opening" === this.readyState || "open" === this.readyState) {
	            this.readyState = "closing";
	            if (this.writeBuffer.length) {
	                this.once("drain", () => {
	                    if (this.upgrading) {
	                        waitForUpgrade();
	                    }
	                    else {
	                        close();
	                    }
	                });
	            }
	            else if (this.upgrading) {
	                waitForUpgrade();
	            }
	            else {
	                close();
	            }
	        }
	        return this;
	    }
	    /**
	     * Called upon transport error
	     *
	     * @private
	     */
	    _onError(err) {
	        debug("socket error %j", err);
	        SocketWithoutUpgrade.priorWebsocketSuccess = false;
	        if (this.opts.tryAllTransports &&
	            this.transports.length > 1 &&
	            this.readyState === "opening") {
	            debug("trying next transport");
	            this.transports.shift();
	            return this._open();
	        }
	        this.emitReserved("error", err);
	        this._onClose("transport error", err);
	    }
	    /**
	     * Called upon transport close.
	     *
	     * @private
	     */
	    _onClose(reason, description) {
	        if ("opening" === this.readyState ||
	            "open" === this.readyState ||
	            "closing" === this.readyState) {
	            debug('socket close with reason: "%s"', reason);
	            // clear timers
	            this.clearTimeoutFn(this._pingTimeoutTimer);
	            // stop event from firing again for transport
	            this.transport.removeAllListeners("close");
	            // ensure transport won't stay open
	            this.transport.close();
	            // ignore further transport communication
	            this.transport.removeAllListeners();
	            if (withEventListeners) {
	                if (this._beforeunloadEventListener) {
	                    removeEventListener("beforeunload", this._beforeunloadEventListener, false);
	                }
	                if (this._offlineEventListener) {
	                    const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
	                    if (i !== -1) {
	                        debug("removing listener for the 'offline' event");
	                        OFFLINE_EVENT_LISTENERS.splice(i, 1);
	                    }
	                }
	            }
	            // set ready state
	            this.readyState = "closed";
	            // clear session id
	            this.id = null;
	            // emit close event
	            this.emitReserved("close", reason, description);
	            // clean buffers after, so users can still
	            // grab the buffers on `close` event
	            this.writeBuffer = [];
	            this._prevBufferLen = 0;
	        }
	    }
	}
	exports.SocketWithoutUpgrade = SocketWithoutUpgrade;
	SocketWithoutUpgrade.protocol = engine_io_parser_1.protocol;
	/**
	 * This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
	 * with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
	 *
	 * This class comes with an upgrade mechanism, which means that once the connection is established with the first
	 * low-level transport, it will try to upgrade to a better transport.
	 *
	 * In order to allow tree-shaking, there are no transports included, that's why the `transports` option is mandatory.
	 *
	 * @example
	 * import { SocketWithUpgrade, WebSocket } from "engine.io-client";
	 *
	 * const socket = new SocketWithUpgrade({
	 *   transports: [WebSocket]
	 * });
	 *
	 * socket.on("open", () => {
	 *   socket.send("hello");
	 * });
	 *
	 * @see SocketWithoutUpgrade
	 * @see Socket
	 */
	class SocketWithUpgrade extends SocketWithoutUpgrade {
	    constructor() {
	        super(...arguments);
	        this._upgrades = [];
	    }
	    onOpen() {
	        super.onOpen();
	        if ("open" === this.readyState && this.opts.upgrade) {
	            debug("starting upgrade probes");
	            for (let i = 0; i < this._upgrades.length; i++) {
	                this._probe(this._upgrades[i]);
	            }
	        }
	    }
	    /**
	     * Probes a transport.
	     *
	     * @param {String} name - transport name
	     * @private
	     */
	    _probe(name) {
	        debug('probing transport "%s"', name);
	        let transport = this.createTransport(name);
	        let failed = false;
	        SocketWithoutUpgrade.priorWebsocketSuccess = false;
	        const onTransportOpen = () => {
	            if (failed)
	                return;
	            debug('probe transport "%s" opened', name);
	            transport.send([{ type: "ping", data: "probe" }]);
	            transport.once("packet", (msg) => {
	                if (failed)
	                    return;
	                if ("pong" === msg.type && "probe" === msg.data) {
	                    debug('probe transport "%s" pong', name);
	                    this.upgrading = true;
	                    this.emitReserved("upgrading", transport);
	                    if (!transport)
	                        return;
	                    SocketWithoutUpgrade.priorWebsocketSuccess =
	                        "websocket" === transport.name;
	                    debug('pausing current transport "%s"', this.transport.name);
	                    this.transport.pause(() => {
	                        if (failed)
	                            return;
	                        if ("closed" === this.readyState)
	                            return;
	                        debug("changing transport and sending upgrade packet");
	                        cleanup();
	                        this.setTransport(transport);
	                        transport.send([{ type: "upgrade" }]);
	                        this.emitReserved("upgrade", transport);
	                        transport = null;
	                        this.upgrading = false;
	                        this.flush();
	                    });
	                }
	                else {
	                    debug('probe transport "%s" failed', name);
	                    const err = new Error("probe error");
	                    // @ts-ignore
	                    err.transport = transport.name;
	                    this.emitReserved("upgradeError", err);
	                }
	            });
	        };
	        function freezeTransport() {
	            if (failed)
	                return;
	            // Any callback called by transport should be ignored since now
	            failed = true;
	            cleanup();
	            transport.close();
	            transport = null;
	        }
	        // Handle any error that happens while probing
	        const onerror = (err) => {
	            const error = new Error("probe error: " + err);
	            // @ts-ignore
	            error.transport = transport.name;
	            freezeTransport();
	            debug('probe transport "%s" failed because of error: %s', name, err);
	            this.emitReserved("upgradeError", error);
	        };
	        function onTransportClose() {
	            onerror("transport closed");
	        }
	        // When the socket is closed while we're probing
	        function onclose() {
	            onerror("socket closed");
	        }
	        // When the socket is upgraded while we're probing
	        function onupgrade(to) {
	            if (transport && to.name !== transport.name) {
	                debug('"%s" works - aborting "%s"', to.name, transport.name);
	                freezeTransport();
	            }
	        }
	        // Remove all listeners on the transport and on self
	        const cleanup = () => {
	            transport.removeListener("open", onTransportOpen);
	            transport.removeListener("error", onerror);
	            transport.removeListener("close", onTransportClose);
	            this.off("close", onclose);
	            this.off("upgrading", onupgrade);
	        };
	        transport.once("open", onTransportOpen);
	        transport.once("error", onerror);
	        transport.once("close", onTransportClose);
	        this.once("close", onclose);
	        this.once("upgrading", onupgrade);
	        if (this._upgrades.indexOf("webtransport") !== -1 &&
	            name !== "webtransport") {
	            // favor WebTransport
	            this.setTimeoutFn(() => {
	                if (!failed) {
	                    transport.open();
	                }
	            }, 200);
	        }
	        else {
	            transport.open();
	        }
	    }
	    onHandshake(data) {
	        this._upgrades = this._filterUpgrades(data.upgrades);
	        super.onHandshake(data);
	    }
	    /**
	     * Filters upgrades, returning only those matching client transports.
	     *
	     * @param {Array} upgrades - server upgrades
	     * @private
	     */
	    _filterUpgrades(upgrades) {
	        const filteredUpgrades = [];
	        for (let i = 0; i < upgrades.length; i++) {
	            if (~this.transports.indexOf(upgrades[i]))
	                filteredUpgrades.push(upgrades[i]);
	        }
	        return filteredUpgrades;
	    }
	}
	exports.SocketWithUpgrade = SocketWithUpgrade;
	/**
	 * This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
	 * with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
	 *
	 * This class comes with an upgrade mechanism, which means that once the connection is established with the first
	 * low-level transport, it will try to upgrade to a better transport.
	 *
	 * @example
	 * import { Socket } from "engine.io-client";
	 *
	 * const socket = new Socket();
	 *
	 * socket.on("open", () => {
	 *   socket.send("hello");
	 * });
	 *
	 * @see SocketWithoutUpgrade
	 * @see SocketWithUpgrade
	 */
	class Socket extends SocketWithUpgrade {
	    constructor(uri, opts = {}) {
	        const o = typeof uri === "object" ? uri : opts;
	        if (!o.transports ||
	            (o.transports && typeof o.transports[0] === "string")) {
	            o.transports = (o.transports || ["polling", "websocket", "webtransport"])
	                .map((transportName) => index_js_1.transports[transportName])
	                .filter((t) => !!t);
	        }
	        super(uri, o);
	    }
	}
	exports.Socket = Socket;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.transports = void 0;
	const polling_xhr_node_js_1 = __webpack_require__(10);
	const websocket_node_js_1 = __webpack_require__(11);
	const webtransport_js_1 = __webpack_require__(21);
	exports.transports = {
	    websocket: websocket_node_js_1.WS,
	    webtransport: webtransport_js_1.WT,
	    polling: polling_xhr_node_js_1.XHR,
	};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Polling = void 0;
	const transport_js_1 = __webpack_require__(7);
	const util_js_1 = __webpack_require__(4);
	const engine_io_parser_1 = __webpack_require__(6);
	const debug_1 = __importDefault(__webpack_require__(5)); // debug()
	const debug = (0, debug_1.default)("engine.io-client:polling"); // debug()
	class Polling extends transport_js_1.Transport {
	    constructor() {
	        super(...arguments);
	        this._polling = false;
	    }
	    get name() {
	        return "polling";
	    }
	    /**
	     * Opens the socket (triggers polling). We write a PING message to determine
	     * when the transport is open.
	     *
	     * @protected
	     */
	    doOpen() {
	        this._poll();
	    }
	    /**
	     * Pauses polling.
	     *
	     * @param {Function} onPause - callback upon buffers are flushed and transport is paused
	     * @package
	     */
	    pause(onPause) {
	        this.readyState = "pausing";
	        const pause = () => {
	            debug("paused");
	            this.readyState = "paused";
	            onPause();
	        };
	        if (this._polling || !this.writable) {
	            let total = 0;
	            if (this._polling) {
	                debug("we are currently polling - waiting to pause");
	                total++;
	                this.once("pollComplete", function () {
	                    debug("pre-pause polling complete");
	                    --total || pause();
	                });
	            }
	            if (!this.writable) {
	                debug("we are currently writing - waiting to pause");
	                total++;
	                this.once("drain", function () {
	                    debug("pre-pause writing complete");
	                    --total || pause();
	                });
	            }
	        }
	        else {
	            pause();
	        }
	    }
	    /**
	     * Starts polling cycle.
	     *
	     * @private
	     */
	    _poll() {
	        debug("polling");
	        this._polling = true;
	        this.doPoll();
	        this.emitReserved("poll");
	    }
	    /**
	     * Overloads onData to detect payloads.
	     *
	     * @protected
	     */
	    onData(data) {
	        debug("polling got data %s", data);
	        const callback = (packet) => {
	            // if its the first message we consider the transport open
	            if ("opening" === this.readyState && packet.type === "open") {
	                this.onOpen();
	            }
	            // if its a close packet, we close the ongoing requests
	            if ("close" === packet.type) {
	                this.onClose({ description: "transport closed by the server" });
	                return false;
	            }
	            // otherwise bypass onData and handle the message
	            this.onPacket(packet);
	        };
	        // decode payload
	        (0, engine_io_parser_1.decodePayload)(data, this.socket.binaryType).forEach(callback);
	        // if an event did not trigger closing
	        if ("closed" !== this.readyState) {
	            // if we got data we're not polling
	            this._polling = false;
	            this.emitReserved("pollComplete");
	            if ("open" === this.readyState) {
	                this._poll();
	            }
	            else {
	                debug('ignoring poll - transport state "%s"', this.readyState);
	            }
	        }
	    }
	    /**
	     * For polling, send a close packet.
	     *
	     * @protected
	     */
	    doClose() {
	        const close = () => {
	            debug("writing close packet");
	            this.write([{ type: "close" }]);
	        };
	        if ("open" === this.readyState) {
	            debug("transport open - closing");
	            close();
	        }
	        else {
	            // in case we're trying to close while
	            // handshaking is in progress (GH-164)
	            debug("transport not open - deferring close");
	            this.once("open", close);
	        }
	    }
	    /**
	     * Writes a packets payload.
	     *
	     * @param {Array} packets - data packets
	     * @protected
	     */
	    write(packets) {
	        this.writable = false;
	        (0, engine_io_parser_1.encodePayload)(packets, (data) => {
	            this.doWrite(data, () => {
	                this.writable = true;
	                this.emitReserved("drain");
	            });
	        });
	    }
	    /**
	     * Generates uri for connection.
	     *
	     * @private
	     */
	    uri() {
	        const schema = this.opts.secure ? "https" : "http";
	        const query = this.query || {};
	        // cache busting is forced
	        if (false !== this.opts.timestampRequests) {
	            query[this.opts.timestampParam] = (0, util_js_1.randomString)();
	        }
	        if (!this.supportsBinary && !query.sid) {
	            query.b64 = 1;
	        }
	        return this.createUri(schema, query);
	    }
	}
	exports.Polling = Polling;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WT = void 0;
	const transport_js_1 = __webpack_require__(7);
	const globals_node_js_1 = __webpack_require__(3);
	const engine_io_parser_1 = __webpack_require__(6);
	const debug_1 = __importDefault(__webpack_require__(5)); // debug()
	const debug = (0, debug_1.default)("engine.io-client:webtransport"); // debug()
	/**
	 * WebTransport transport based on the built-in `WebTransport` object.
	 *
	 * Usage: browser, Node.js (with the `@fails-components/webtransport` package)
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
	 * @see https://caniuse.com/webtransport
	 */
	class WT extends transport_js_1.Transport {
	    get name() {
	        return "webtransport";
	    }
	    doOpen() {
	        try {
	            // @ts-ignore
	            this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
	        }
	        catch (err) {
	            return this.emitReserved("error", err);
	        }
	        this._transport.closed
	            .then(() => {
	            debug("transport closed gracefully");
	            this.onClose();
	        })
	            .catch((err) => {
	            debug("transport closed due to %s", err);
	            this.onError("webtransport error", err);
	        });
	        // note: we could have used async/await, but that would require some additional polyfills
	        this._transport.ready.then(() => {
	            this._transport.createBidirectionalStream().then((stream) => {
	                const decoderStream = (0, engine_io_parser_1.createPacketDecoderStream)(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
	                const reader = stream.readable.pipeThrough(decoderStream).getReader();
	                const encoderStream = (0, engine_io_parser_1.createPacketEncoderStream)();
	                encoderStream.readable.pipeTo(stream.writable);
	                this._writer = encoderStream.writable.getWriter();
	                const read = () => {
	                    reader
	                        .read()
	                        .then(({ done, value }) => {
	                        if (done) {
	                            debug("session is closed");
	                            return;
	                        }
	                        debug("received chunk: %o", value);
	                        this.onPacket(value);
	                        read();
	                    })
	                        .catch((err) => {
	                        debug("an error occurred while reading: %s", err);
	                    });
	                };
	                read();
	                const packet = { type: "open" };
	                if (this.query.sid) {
	                    packet.data = `{"sid":"${this.query.sid}"}`;
	                }
	                this._writer.write(packet).then(() => this.onOpen());
	            });
	        });
	    }
	    write(packets) {
	        this.writable = false;
	        for (let i = 0; i < packets.length; i++) {
	            const packet = packets[i];
	            const lastPacket = i === packets.length - 1;
	            this._writer.write(packet).then(() => {
	                if (lastPacket) {
	                    (0, globals_node_js_1.nextTick)(() => {
	                        this.writable = true;
	                        this.emitReserved("drain");
	                    }, this.setTimeoutFn);
	                }
	            });
	        }
	    }
	    doClose() {
	        var _a;
	        (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
	    }
	}
	exports.WT = WT;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.on = on;
	function on(obj, ev, fn) {
	    obj.on(ev, fn);
	    return function subDestroy() {
	        obj.off(ev, fn);
	    };
	}


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Socket = void 0;
	const socket_io_parser_1 = __webpack_require__(14);
	const on_js_1 = __webpack_require__(22);
	const component_emitter_1 = __webpack_require__(2);
	const debug_1 = __importDefault(__webpack_require__(8)); // debug()
	const debug = (0, debug_1.default)("socket.io-client:socket"); // debug()
	/**
	 * Internal events.
	 * These events can't be emitted by the user.
	 */
	const RESERVED_EVENTS = Object.freeze({
	    connect: 1,
	    connect_error: 1,
	    disconnect: 1,
	    disconnecting: 1,
	    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
	    newListener: 1,
	    removeListener: 1,
	});
	/**
	 * A Socket is the fundamental class for interacting with the server.
	 *
	 * A Socket belongs to a certain Namespace (by default /) and uses an underlying {@link Manager} to communicate.
	 *
	 * @example
	 * const socket = io();
	 *
	 * socket.on("connect", () => {
	 *   console.log("connected");
	 * });
	 *
	 * // send an event to the server
	 * socket.emit("foo", "bar");
	 *
	 * socket.on("foobar", () => {
	 *   // an event was received from the server
	 * });
	 *
	 * // upon disconnection
	 * socket.on("disconnect", (reason) => {
	 *   console.log(`disconnected due to ${reason}`);
	 * });
	 */
	class Socket extends component_emitter_1.Emitter {
	    /**
	     * `Socket` constructor.
	     */
	    constructor(io, nsp, opts) {
	        super();
	        /**
	         * Whether the socket is currently connected to the server.
	         *
	         * @example
	         * const socket = io();
	         *
	         * socket.on("connect", () => {
	         *   console.log(socket.connected); // true
	         * });
	         *
	         * socket.on("disconnect", () => {
	         *   console.log(socket.connected); // false
	         * });
	         */
	        this.connected = false;
	        /**
	         * Whether the connection state was recovered after a temporary disconnection. In that case, any missed packets will
	         * be transmitted by the server.
	         */
	        this.recovered = false;
	        /**
	         * Buffer for packets received before the CONNECT packet
	         */
	        this.receiveBuffer = [];
	        /**
	         * Buffer for packets that will be sent once the socket is connected
	         */
	        this.sendBuffer = [];
	        /**
	         * The queue of packets to be sent with retry in case of failure.
	         *
	         * Packets are sent one by one, each waiting for the server acknowledgement, in order to guarantee the delivery order.
	         * @private
	         */
	        this._queue = [];
	        /**
	         * A sequence to generate the ID of the {@link QueuedPacket}.
	         * @private
	         */
	        this._queueSeq = 0;
	        this.ids = 0;
	        /**
	         * A map containing acknowledgement handlers.
	         *
	         * The `withError` attribute is used to differentiate handlers that accept an error as first argument:
	         *
	         * - `socket.emit("test", (err, value) => { ... })` with `ackTimeout` option
	         * - `socket.timeout(5000).emit("test", (err, value) => { ... })`
	         * - `const value = await socket.emitWithAck("test")`
	         *
	         * From those that don't:
	         *
	         * - `socket.emit("test", (value) => { ... });`
	         *
	         * In the first case, the handlers will be called with an error when:
	         *
	         * - the timeout is reached
	         * - the socket gets disconnected
	         *
	         * In the second case, the handlers will be simply discarded upon disconnection, since the client will never receive
	         * an acknowledgement from the server.
	         *
	         * @private
	         */
	        this.acks = {};
	        this.flags = {};
	        this.io = io;
	        this.nsp = nsp;
	        if (opts && opts.auth) {
	            this.auth = opts.auth;
	        }
	        this._opts = Object.assign({}, opts);
	        if (this.io._autoConnect)
	            this.open();
	    }
	    /**
	     * Whether the socket is currently disconnected
	     *
	     * @example
	     * const socket = io();
	     *
	     * socket.on("connect", () => {
	     *   console.log(socket.disconnected); // false
	     * });
	     *
	     * socket.on("disconnect", () => {
	     *   console.log(socket.disconnected); // true
	     * });
	     */
	    get disconnected() {
	        return !this.connected;
	    }
	    /**
	     * Subscribe to open, close and packet events
	     *
	     * @private
	     */
	    subEvents() {
	        if (this.subs)
	            return;
	        const io = this.io;
	        this.subs = [
	            (0, on_js_1.on)(io, "open", this.onopen.bind(this)),
	            (0, on_js_1.on)(io, "packet", this.onpacket.bind(this)),
	            (0, on_js_1.on)(io, "error", this.onerror.bind(this)),
	            (0, on_js_1.on)(io, "close", this.onclose.bind(this)),
	        ];
	    }
	    /**
	     * Whether the Socket will try to reconnect when its Manager connects or reconnects.
	     *
	     * @example
	     * const socket = io();
	     *
	     * console.log(socket.active); // true
	     *
	     * socket.on("disconnect", (reason) => {
	     *   if (reason === "io server disconnect") {
	     *     // the disconnection was initiated by the server, you need to manually reconnect
	     *     console.log(socket.active); // false
	     *   }
	     *   // else the socket will automatically try to reconnect
	     *   console.log(socket.active); // true
	     * });
	     */
	    get active() {
	        return !!this.subs;
	    }
	    /**
	     * "Opens" the socket.
	     *
	     * @example
	     * const socket = io({
	     *   autoConnect: false
	     * });
	     *
	     * socket.connect();
	     */
	    connect() {
	        if (this.connected)
	            return this;
	        this.subEvents();
	        if (!this.io["_reconnecting"])
	            this.io.open(); // ensure open
	        if ("open" === this.io._readyState)
	            this.onopen();
	        return this;
	    }
	    /**
	     * Alias for {@link connect()}.
	     */
	    open() {
	        return this.connect();
	    }
	    /**
	     * Sends a `message` event.
	     *
	     * This method mimics the WebSocket.send() method.
	     *
	     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
	     *
	     * @example
	     * socket.send("hello");
	     *
	     * // this is equivalent to
	     * socket.emit("message", "hello");
	     *
	     * @return self
	     */
	    send(...args) {
	        args.unshift("message");
	        this.emit.apply(this, args);
	        return this;
	    }
	    /**
	     * Override `emit`.
	     * If the event is in `events`, it's emitted normally.
	     *
	     * @example
	     * socket.emit("hello", "world");
	     *
	     * // all serializable datastructures are supported (no need to call JSON.stringify)
	     * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
	     *
	     * // with an acknowledgement from the server
	     * socket.emit("hello", "world", (val) => {
	     *   // ...
	     * });
	     *
	     * @return self
	     */
	    emit(ev, ...args) {
	        var _a, _b, _c;
	        if (RESERVED_EVENTS.hasOwnProperty(ev)) {
	            throw new Error('"' + ev.toString() + '" is a reserved event name');
	        }
	        args.unshift(ev);
	        if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
	            this._addToQueue(args);
	            return this;
	        }
	        const packet = {
	            type: socket_io_parser_1.PacketType.EVENT,
	            data: args,
	        };
	        packet.options = {};
	        packet.options.compress = this.flags.compress !== false;
	        // event ack callback
	        if ("function" === typeof args[args.length - 1]) {
	            const id = this.ids++;
	            debug("emitting packet with ack id %d", id);
	            const ack = args.pop();
	            this._registerAckCallback(id, ack);
	            packet.id = id;
	        }
	        const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
	        const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
	        const discardPacket = this.flags.volatile && !isTransportWritable;
	        if (discardPacket) {
	            debug("discard packet as the transport is not currently writable");
	        }
	        else if (isConnected) {
	            this.notifyOutgoingListeners(packet);
	            this.packet(packet);
	        }
	        else {
	            this.sendBuffer.push(packet);
	        }
	        this.flags = {};
	        return this;
	    }
	    /**
	     * @private
	     */
	    _registerAckCallback(id, ack) {
	        var _a;
	        const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
	        if (timeout === undefined) {
	            this.acks[id] = ack;
	            return;
	        }
	        // @ts-ignore
	        const timer = this.io.setTimeoutFn(() => {
	            delete this.acks[id];
	            for (let i = 0; i < this.sendBuffer.length; i++) {
	                if (this.sendBuffer[i].id === id) {
	                    debug("removing packet with ack id %d from the buffer", id);
	                    this.sendBuffer.splice(i, 1);
	                }
	            }
	            debug("event with ack id %d has timed out after %d ms", id, timeout);
	            ack.call(this, new Error("operation has timed out"));
	        }, timeout);
	        const fn = (...args) => {
	            // @ts-ignore
	            this.io.clearTimeoutFn(timer);
	            ack.apply(this, args);
	        };
	        fn.withError = true;
	        this.acks[id] = fn;
	    }
	    /**
	     * Emits an event and waits for an acknowledgement
	     *
	     * @example
	     * // without timeout
	     * const response = await socket.emitWithAck("hello", "world");
	     *
	     * // with a specific timeout
	     * try {
	     *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
	     * } catch (err) {
	     *   // the server did not acknowledge the event in the given delay
	     * }
	     *
	     * @return a Promise that will be fulfilled when the server acknowledges the event
	     */
	    emitWithAck(ev, ...args) {
	        return new Promise((resolve, reject) => {
	            const fn = (arg1, arg2) => {
	                return arg1 ? reject(arg1) : resolve(arg2);
	            };
	            fn.withError = true;
	            args.push(fn);
	            this.emit(ev, ...args);
	        });
	    }
	    /**
	     * Add the packet to the queue.
	     * @param args
	     * @private
	     */
	    _addToQueue(args) {
	        let ack;
	        if (typeof args[args.length - 1] === "function") {
	            ack = args.pop();
	        }
	        const packet = {
	            id: this._queueSeq++,
	            tryCount: 0,
	            pending: false,
	            args,
	            flags: Object.assign({ fromQueue: true }, this.flags),
	        };
	        args.push((err, ...responseArgs) => {
	            if (packet !== this._queue[0]) {
	                // the packet has already been acknowledged
	                return;
	            }
	            const hasError = err !== null;
	            if (hasError) {
	                if (packet.tryCount > this._opts.retries) {
	                    debug("packet [%d] is discarded after %d tries", packet.id, packet.tryCount);
	                    this._queue.shift();
	                    if (ack) {
	                        ack(err);
	                    }
	                }
	            }
	            else {
	                debug("packet [%d] was successfully sent", packet.id);
	                this._queue.shift();
	                if (ack) {
	                    ack(null, ...responseArgs);
	                }
	            }
	            packet.pending = false;
	            return this._drainQueue();
	        });
	        this._queue.push(packet);
	        this._drainQueue();
	    }
	    /**
	     * Send the first packet of the queue, and wait for an acknowledgement from the server.
	     * @param force - whether to resend a packet that has not been acknowledged yet
	     *
	     * @private
	     */
	    _drainQueue(force = false) {
	        debug("draining queue");
	        if (!this.connected || this._queue.length === 0) {
	            return;
	        }
	        const packet = this._queue[0];
	        if (packet.pending && !force) {
	            debug("packet [%d] has already been sent and is waiting for an ack", packet.id);
	            return;
	        }
	        packet.pending = true;
	        packet.tryCount++;
	        debug("sending packet [%d] (try n°%d)", packet.id, packet.tryCount);
	        this.flags = packet.flags;
	        this.emit.apply(this, packet.args);
	    }
	    /**
	     * Sends a packet.
	     *
	     * @param packet
	     * @private
	     */
	    packet(packet) {
	        packet.nsp = this.nsp;
	        this.io._packet(packet);
	    }
	    /**
	     * Called upon engine `open`.
	     *
	     * @private
	     */
	    onopen() {
	        debug("transport is open - connecting");
	        if (typeof this.auth == "function") {
	            this.auth((data) => {
	                this._sendConnectPacket(data);
	            });
	        }
	        else {
	            this._sendConnectPacket(this.auth);
	        }
	    }
	    /**
	     * Sends a CONNECT packet to initiate the Socket.IO session.
	     *
	     * @param data
	     * @private
	     */
	    _sendConnectPacket(data) {
	        this.packet({
	            type: socket_io_parser_1.PacketType.CONNECT,
	            data: this._pid
	                ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data)
	                : data,
	        });
	    }
	    /**
	     * Called upon engine or manager `error`.
	     *
	     * @param err
	     * @private
	     */
	    onerror(err) {
	        if (!this.connected) {
	            this.emitReserved("connect_error", err);
	        }
	    }
	    /**
	     * Called upon engine `close`.
	     *
	     * @param reason
	     * @param description
	     * @private
	     */
	    onclose(reason, description) {
	        debug("close (%s)", reason);
	        this.connected = false;
	        delete this.id;
	        this.emitReserved("disconnect", reason, description);
	        this._clearAcks();
	    }
	    /**
	     * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
	     * the server.
	     *
	     * @private
	     */
	    _clearAcks() {
	        Object.keys(this.acks).forEach((id) => {
	            const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
	            if (!isBuffered) {
	                // note: handlers that do not accept an error as first argument are ignored here
	                const ack = this.acks[id];
	                delete this.acks[id];
	                if (ack.withError) {
	                    ack.call(this, new Error("socket has been disconnected"));
	                }
	            }
	        });
	    }
	    /**
	     * Called with socket packet.
	     *
	     * @param packet
	     * @private
	     */
	    onpacket(packet) {
	        const sameNamespace = packet.nsp === this.nsp;
	        if (!sameNamespace)
	            return;
	        switch (packet.type) {
	            case socket_io_parser_1.PacketType.CONNECT:
	                if (packet.data && packet.data.sid) {
	                    this.onconnect(packet.data.sid, packet.data.pid);
	                }
	                else {
	                    this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
	                }
	                break;
	            case socket_io_parser_1.PacketType.EVENT:
	            case socket_io_parser_1.PacketType.BINARY_EVENT:
	                this.onevent(packet);
	                break;
	            case socket_io_parser_1.PacketType.ACK:
	            case socket_io_parser_1.PacketType.BINARY_ACK:
	                this.onack(packet);
	                break;
	            case socket_io_parser_1.PacketType.DISCONNECT:
	                this.ondisconnect();
	                break;
	            case socket_io_parser_1.PacketType.CONNECT_ERROR:
	                this.destroy();
	                const err = new Error(packet.data.message);
	                // @ts-ignore
	                err.data = packet.data.data;
	                this.emitReserved("connect_error", err);
	                break;
	        }
	    }
	    /**
	     * Called upon a server event.
	     *
	     * @param packet
	     * @private
	     */
	    onevent(packet) {
	        const args = packet.data || [];
	        debug("emitting event %j", args);
	        if (null != packet.id) {
	            debug("attaching ack callback to event");
	            args.push(this.ack(packet.id));
	        }
	        if (this.connected) {
	            this.emitEvent(args);
	        }
	        else {
	            this.receiveBuffer.push(Object.freeze(args));
	        }
	    }
	    emitEvent(args) {
	        if (this._anyListeners && this._anyListeners.length) {
	            const listeners = this._anyListeners.slice();
	            for (const listener of listeners) {
	                listener.apply(this, args);
	            }
	        }
	        super.emit.apply(this, args);
	        if (this._pid && args.length && typeof args[args.length - 1] === "string") {
	            this._lastOffset = args[args.length - 1];
	        }
	    }
	    /**
	     * Produces an ack callback to emit with an event.
	     *
	     * @private
	     */
	    ack(id) {
	        const self = this;
	        let sent = false;
	        return function (...args) {
	            // prevent double callbacks
	            if (sent)
	                return;
	            sent = true;
	            debug("sending ack %j", args);
	            self.packet({
	                type: socket_io_parser_1.PacketType.ACK,
	                id: id,
	                data: args,
	            });
	        };
	    }
	    /**
	     * Called upon a server acknowledgement.
	     *
	     * @param packet
	     * @private
	     */
	    onack(packet) {
	        const ack = this.acks[packet.id];
	        if (typeof ack !== "function") {
	            debug("bad ack %s", packet.id);
	            return;
	        }
	        delete this.acks[packet.id];
	        debug("calling ack %s with %j", packet.id, packet.data);
	        // @ts-ignore FIXME ack is incorrectly inferred as 'never'
	        if (ack.withError) {
	            packet.data.unshift(null);
	        }
	        // @ts-ignore
	        ack.apply(this, packet.data);
	    }
	    /**
	     * Called upon server connect.
	     *
	     * @private
	     */
	    onconnect(id, pid) {
	        debug("socket connected with id %s", id);
	        this.id = id;
	        this.recovered = pid && this._pid === pid;
	        this._pid = pid; // defined only if connection state recovery is enabled
	        this.connected = true;
	        this.emitBuffered();
	        this.emitReserved("connect");
	        this._drainQueue(true);
	    }
	    /**
	     * Emit buffered events (received and emitted).
	     *
	     * @private
	     */
	    emitBuffered() {
	        this.receiveBuffer.forEach((args) => this.emitEvent(args));
	        this.receiveBuffer = [];
	        this.sendBuffer.forEach((packet) => {
	            this.notifyOutgoingListeners(packet);
	            this.packet(packet);
	        });
	        this.sendBuffer = [];
	    }
	    /**
	     * Called upon server disconnect.
	     *
	     * @private
	     */
	    ondisconnect() {
	        debug("server disconnect (%s)", this.nsp);
	        this.destroy();
	        this.onclose("io server disconnect");
	    }
	    /**
	     * Called upon forced client/server side disconnections,
	     * this method ensures the manager stops tracking us and
	     * that reconnections don't get triggered for this.
	     *
	     * @private
	     */
	    destroy() {
	        if (this.subs) {
	            // clean subscriptions to avoid reconnections
	            this.subs.forEach((subDestroy) => subDestroy());
	            this.subs = undefined;
	        }
	        this.io["_destroy"](this);
	    }
	    /**
	     * Disconnects the socket manually. In that case, the socket will not try to reconnect.
	     *
	     * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
	     *
	     * @example
	     * const socket = io();
	     *
	     * socket.on("disconnect", (reason) => {
	     *   // console.log(reason); prints "io client disconnect"
	     * });
	     *
	     * socket.disconnect();
	     *
	     * @return self
	     */
	    disconnect() {
	        if (this.connected) {
	            debug("performing disconnect (%s)", this.nsp);
	            this.packet({ type: socket_io_parser_1.PacketType.DISCONNECT });
	        }
	        // remove socket from pool
	        this.destroy();
	        if (this.connected) {
	            // fire events
	            this.onclose("io client disconnect");
	        }
	        return this;
	    }
	    /**
	     * Alias for {@link disconnect()}.
	     *
	     * @return self
	     */
	    close() {
	        return this.disconnect();
	    }
	    /**
	     * Sets the compress flag.
	     *
	     * @example
	     * socket.compress(false).emit("hello");
	     *
	     * @param compress - if `true`, compresses the sending data
	     * @return self
	     */
	    compress(compress) {
	        this.flags.compress = compress;
	        return this;
	    }
	    /**
	     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
	     * ready to send messages.
	     *
	     * @example
	     * socket.volatile.emit("hello"); // the server may or may not receive it
	     *
	     * @returns self
	     */
	    get volatile() {
	        this.flags.volatile = true;
	        return this;
	    }
	    /**
	     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
	     * given number of milliseconds have elapsed without an acknowledgement from the server:
	     *
	     * @example
	     * socket.timeout(5000).emit("my-event", (err) => {
	     *   if (err) {
	     *     // the server did not acknowledge the event in the given delay
	     *   }
	     * });
	     *
	     * @returns self
	     */
	    timeout(timeout) {
	        this.flags.timeout = timeout;
	        return this;
	    }
	    /**
	     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
	     * callback.
	     *
	     * @example
	     * socket.onAny((event, ...args) => {
	     *   console.log(`got ${event}`);
	     * });
	     *
	     * @param listener
	     */
	    onAny(listener) {
	        this._anyListeners = this._anyListeners || [];
	        this._anyListeners.push(listener);
	        return this;
	    }
	    /**
	     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
	     * callback. The listener is added to the beginning of the listeners array.
	     *
	     * @example
	     * socket.prependAny((event, ...args) => {
	     *   console.log(`got event ${event}`);
	     * });
	     *
	     * @param listener
	     */
	    prependAny(listener) {
	        this._anyListeners = this._anyListeners || [];
	        this._anyListeners.unshift(listener);
	        return this;
	    }
	    /**
	     * Removes the listener that will be fired when any event is emitted.
	     *
	     * @example
	     * const catchAllListener = (event, ...args) => {
	     *   console.log(`got event ${event}`);
	     * }
	     *
	     * socket.onAny(catchAllListener);
	     *
	     * // remove a specific listener
	     * socket.offAny(catchAllListener);
	     *
	     * // or remove all listeners
	     * socket.offAny();
	     *
	     * @param listener
	     */
	    offAny(listener) {
	        if (!this._anyListeners) {
	            return this;
	        }
	        if (listener) {
	            const listeners = this._anyListeners;
	            for (let i = 0; i < listeners.length; i++) {
	                if (listener === listeners[i]) {
	                    listeners.splice(i, 1);
	                    return this;
	                }
	            }
	        }
	        else {
	            this._anyListeners = [];
	        }
	        return this;
	    }
	    /**
	     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
	     * e.g. to remove listeners.
	     */
	    listenersAny() {
	        return this._anyListeners || [];
	    }
	    /**
	     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
	     * callback.
	     *
	     * Note: acknowledgements sent to the server are not included.
	     *
	     * @example
	     * socket.onAnyOutgoing((event, ...args) => {
	     *   console.log(`sent event ${event}`);
	     * });
	     *
	     * @param listener
	     */
	    onAnyOutgoing(listener) {
	        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
	        this._anyOutgoingListeners.push(listener);
	        return this;
	    }
	    /**
	     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
	     * callback. The listener is added to the beginning of the listeners array.
	     *
	     * Note: acknowledgements sent to the server are not included.
	     *
	     * @example
	     * socket.prependAnyOutgoing((event, ...args) => {
	     *   console.log(`sent event ${event}`);
	     * });
	     *
	     * @param listener
	     */
	    prependAnyOutgoing(listener) {
	        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
	        this._anyOutgoingListeners.unshift(listener);
	        return this;
	    }
	    /**
	     * Removes the listener that will be fired when any event is emitted.
	     *
	     * @example
	     * const catchAllListener = (event, ...args) => {
	     *   console.log(`sent event ${event}`);
	     * }
	     *
	     * socket.onAnyOutgoing(catchAllListener);
	     *
	     * // remove a specific listener
	     * socket.offAnyOutgoing(catchAllListener);
	     *
	     * // or remove all listeners
	     * socket.offAnyOutgoing();
	     *
	     * @param [listener] - the catch-all listener (optional)
	     */
	    offAnyOutgoing(listener) {
	        if (!this._anyOutgoingListeners) {
	            return this;
	        }
	        if (listener) {
	            const listeners = this._anyOutgoingListeners;
	            for (let i = 0; i < listeners.length; i++) {
	                if (listener === listeners[i]) {
	                    listeners.splice(i, 1);
	                    return this;
	                }
	            }
	        }
	        else {
	            this._anyOutgoingListeners = [];
	        }
	        return this;
	    }
	    /**
	     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
	     * e.g. to remove listeners.
	     */
	    listenersAnyOutgoing() {
	        return this._anyOutgoingListeners || [];
	    }
	    /**
	     * Notify the listeners for each packet sent
	     *
	     * @param packet
	     *
	     * @private
	     */
	    notifyOutgoingListeners(packet) {
	        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
	            const listeners = this._anyOutgoingListeners.slice();
	            for (const listener of listeners) {
	                listener.apply(this, packet.data);
	            }
	        }
	    }
	}
	exports.Socket = Socket;


/***/ }),
/* 24 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hasBinary = exports.isBinary = void 0;
	const withNativeArrayBuffer = typeof ArrayBuffer === "function";
	const isView = (obj) => {
	    return typeof ArrayBuffer.isView === "function"
	        ? ArrayBuffer.isView(obj)
	        : obj.buffer instanceof ArrayBuffer;
	};
	const toString = Object.prototype.toString;
	const withNativeBlob = typeof Blob === "function" ||
	    (typeof Blob !== "undefined" &&
	        toString.call(Blob) === "[object BlobConstructor]");
	const withNativeFile = typeof File === "function" ||
	    (typeof File !== "undefined" &&
	        toString.call(File) === "[object FileConstructor]");
	/**
	 * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
	 *
	 * @private
	 */
	function isBinary(obj) {
	    return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
	        (withNativeBlob && obj instanceof Blob) ||
	        (withNativeFile && obj instanceof File));
	}
	exports.isBinary = isBinary;
	function hasBinary(obj, toJSON) {
	    if (!obj || typeof obj !== "object") {
	        return false;
	    }
	    if (Array.isArray(obj)) {
	        for (let i = 0, l = obj.length; i < l; i++) {
	            if (hasBinary(obj[i])) {
	                return true;
	            }
	        }
	        return false;
	    }
	    if (isBinary(obj)) {
	        return true;
	    }
	    if (obj.toJSON &&
	        typeof obj.toJSON === "function" &&
	        arguments.length === 1) {
	        return hasBinary(obj.toJSON(), true);
	    }
	    for (const key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
	            return true;
	        }
	    }
	    return false;
	}
	exports.hasBinary = hasBinary;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {"use strict"
	// Module export pattern from
	// https://github.com/umdjs/umd/blob/master/returnExports.js
	;(function (root, factory) {
	    if (true) {
	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        // Node. Does not work with strict CommonJS, but
	        // only CommonJS-like environments that support module.exports,
	        // like Node.
	        module.exports = factory();
	    } else {
	        // Browser globals (root is window)
	        root.store = factory();
	  }
	}(this, function () {
		
		// Store.js
		var store = {},
			win = (typeof window != 'undefined' ? window : global),
			doc = win.document,
			localStorageName = 'localStorage',
			scriptTag = 'script',
			storage
	
		store.disabled = false
		store.version = '1.3.20'
		store.set = function(key, value) {}
		store.get = function(key, defaultVal) {}
		store.has = function(key) { return store.get(key) !== undefined }
		store.remove = function(key) {}
		store.clear = function() {}
		store.transact = function(key, defaultVal, transactionFn) {
			if (transactionFn == null) {
				transactionFn = defaultVal
				defaultVal = null
			}
			if (defaultVal == null) {
				defaultVal = {}
			}
			var val = store.get(key, defaultVal)
			transactionFn(val)
			store.set(key, val)
		}
		store.getAll = function() {}
		store.forEach = function() {}
	
		store.serialize = function(value) {
			return JSON.stringify(value)
		}
		store.deserialize = function(value) {
			if (typeof value != 'string') { return undefined }
			try { return JSON.parse(value) }
			catch(e) { return value || undefined }
		}
	
		// Functions to encapsulate questionable FireFox 3.6.13 behavior
		// when about.config::dom.storage.enabled === false
		// See https://github.com/marcuswestin/store.js/issues#issue/13
		function isLocalStorageNameSupported() {
			try { return (localStorageName in win && win[localStorageName]) }
			catch(err) { return false }
		}
	
		if (isLocalStorageNameSupported()) {
			storage = win[localStorageName]
			store.set = function(key, val) {
				if (val === undefined) { return store.remove(key) }
				storage.setItem(key, store.serialize(val))
				return val
			}
			store.get = function(key, defaultVal) {
				var val = store.deserialize(storage.getItem(key))
				return (val === undefined ? defaultVal : val)
			}
			store.remove = function(key) { storage.removeItem(key) }
			store.clear = function() { storage.clear() }
			store.getAll = function() {
				var ret = {}
				store.forEach(function(key, val) {
					ret[key] = val
				})
				return ret
			}
			store.forEach = function(callback) {
				for (var i=0; i<storage.length; i++) {
					var key = storage.key(i)
					callback(key, store.get(key))
				}
			}
		} else if (doc && doc.documentElement.addBehavior) {
			var storageOwner,
				storageContainer
			// Since #userData storage applies only to specific paths, we need to
			// somehow link our data to a specific path.  We choose /favicon.ico
			// as a pretty safe option, since all browsers already make a request to
			// this URL anyway and being a 404 will not hurt us here.  We wrap an
			// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
			// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
			// since the iframe access rules appear to allow direct access and
			// manipulation of the document element, even for a 404 page.  This
			// document can be used instead of the current document (which would
			// have been limited to the current path) to perform #userData storage.
			try {
				storageContainer = new ActiveXObject('htmlfile')
				storageContainer.open()
				storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
				storageContainer.close()
				storageOwner = storageContainer.w.frames[0].document
				storage = storageOwner.createElement('div')
			} catch(e) {
				// somehow ActiveXObject instantiation failed (perhaps some special
				// security settings or otherwse), fall back to per-path storage
				storage = doc.createElement('div')
				storageOwner = doc.body
			}
			var withIEStorage = function(storeFunction) {
				return function() {
					var args = Array.prototype.slice.call(arguments, 0)
					args.unshift(storage)
					// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
					// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
					storageOwner.appendChild(storage)
					storage.addBehavior('#default#userData')
					storage.load(localStorageName)
					var result = storeFunction.apply(store, args)
					storageOwner.removeChild(storage)
					return result
				}
			}
	
			// In IE7, keys cannot start with a digit or contain certain chars.
			// See https://github.com/marcuswestin/store.js/issues/40
			// See https://github.com/marcuswestin/store.js/issues/83
			var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
			var ieKeyFix = function(key) {
				return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
			}
			store.set = withIEStorage(function(storage, key, val) {
				key = ieKeyFix(key)
				if (val === undefined) { return store.remove(key) }
				storage.setAttribute(key, store.serialize(val))
				storage.save(localStorageName)
				return val
			})
			store.get = withIEStorage(function(storage, key, defaultVal) {
				key = ieKeyFix(key)
				var val = store.deserialize(storage.getAttribute(key))
				return (val === undefined ? defaultVal : val)
			})
			store.remove = withIEStorage(function(storage, key) {
				key = ieKeyFix(key)
				storage.removeAttribute(key)
				storage.save(localStorageName)
			})
			store.clear = withIEStorage(function(storage) {
				var attributes = storage.XMLDocument.documentElement.attributes
				storage.load(localStorageName)
				for (var i=attributes.length-1; i>=0; i--) {
					storage.removeAttribute(attributes[i].name)
				}
				storage.save(localStorageName)
			})
			store.getAll = function(storage) {
				var ret = {}
				store.forEach(function(key, val) {
					ret[key] = val
				})
				return ret
			}
			store.forEach = withIEStorage(function(storage, callback) {
				var attributes = storage.XMLDocument.documentElement.attributes
				for (var i=0, attr; attr=attributes[i]; ++i) {
					callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
				}
			})
		}
	
		try {
			var testKey = '__storejs__'
			store.set(testKey, testKey)
			if (store.get(testKey) != testKey) { store.disabled = true }
			store.remove(testKey)
		} catch(e) {
			store.disabled = true
		}
		store.enabled = !store.disabled
		
		return store
	}));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _preact = __webpack_require__(1);
	
	var _chat = __webpack_require__(27);
	
	var _chat2 = _interopRequireDefault(_chat);
	
	var _store = __webpack_require__(25);
	
	var store = _interopRequireWildcard(_store);
	
	var _humanReadableIds = __webpack_require__(47);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var conf = {};
	var CustomData = {};
	var confString = getUrlParameter('conf');
	var CustomDataString = getUrlParameter('CustomData');
	
	if (CustomDataString) {
	    try {
	        CustomData = JSON.parse(CustomDataString);
	    } catch (e) {
	        console.log('Failed to parse conf', CustomDataString, e);
	    }
	}
	
	if (confString) {
	    try {
	        conf = JSON.parse(confString);
	    } catch (e) {
	        console.log('Failed to parse conf', confString, e);
	    }
	}
	
	(0, _preact.render)((0, _preact.h)(_chat2.default, {
	    chatId: getUrlParameter('id'),
	    userId: getUserId(),
	    CustomData: CustomData,
	    host: getUrlParameter('host'),
	    conf: conf
	}), document.getElementById('intergramChat'));
	
	function getUrlParameter(name) {
	    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	    var results = regex.exec(location.search);
	    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}
	
	function generateGuestUsername() {
	    return 'Guest-' + Math.random().toString(36).substr(2, 6);
	}
	
	function getUserId() {
	
	    if (store.enabled) {
	        var userId = store.get('userId');
	
	        if (CustomData && CustomData.username && CustomData.username !== userId) {
	            store.set('userId', CustomData.username);
	            return CustomData.username;
	        }
	
	        if (!userId) {
	            var generatedUserId = conf.humanReadableIds ? _humanReadableIds.hri.random() : generateGuestUsername();
	            store.set('userId', generatedUserId);
	            return generatedUserId;
	        }
	
	        return userId;
	    } else {
	        return CustomData.username || (conf.humanReadableIds ? _humanReadableIds.hri.random() : generateGuestUsername());
	    }
	}

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _store = __webpack_require__(25);
	
	var store = _interopRequireWildcard(_store);
	
	var _socket = __webpack_require__(51);
	
	var _socket2 = _interopRequireDefault(_socket);
	
	var _preact = __webpack_require__(1);
	
	var _messageArea = __webpack_require__(28);
	
	var _messageArea2 = _interopRequireDefault(_messageArea);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Chat = function (_Component) {
	    _inherits(Chat, _Component);
	
	    function Chat(props) {
	        _classCallCheck(this, Chat);
	
	        // CRITICAL: Two separate message arrays - one for each tab
	        var _this = _possibleConstructorReturn(this, (Chat.__proto__ || Object.getPrototypeOf(Chat)).call(this, props));
	
	        _this.autoResponseState = 'pristine';
	        _this.autoResponseTimer = 0;
	
	        _this.handleClearChat = function (event) {
	            console.log('Message received:', event.data);
	            if (event.data && event.data.type === 'CLEAR_CHAT') {
	                console.log('Clearing chat...');
	
	                // Clear both arrays
	                _this.aiMessages = [];
	                _this.humanMessages = [];
	
	                // Clear localStorage
	                if (store.enabled) {
	                    store.remove(_this.aiMessagesKey);
	                    store.remove(_this.humanMessagesKey);
	                }
	
	                // Re-add intro messages
	                if (_this.props.conf.aiIntroMessage) {
	                    _this.aiMessages.push({ text: _this.props.conf.aiIntroMessage, from: 'admin', time: new Date() });
	                    if (store.enabled) {
	                        store.set(_this.aiMessagesKey, _this.aiMessages);
	                    }
	                }
	
	                if (_this.props.conf.introMessage) {
	                    _this.humanMessages.push({ text: _this.props.conf.introMessage, from: 'admin', time: new Date() });
	                    if (store.enabled) {
	                        store.set(_this.humanMessagesKey, _this.humanMessages);
	                    }
	                }
	
	                // Update state
	                _this.setState({
	                    messages: _this.state.humanMode ? _this.humanMessages : _this.aiMessages
	                });
	            }
	        };
	
	        _this.switchTab = function (isHumanMode) {
	            var newMessages = isHumanMode ? _this.humanMessages : _this.aiMessages;
	            _this.setState({
	                humanMode: isHumanMode,
	                messages: newMessages
	            });
	        };
	
	        _this.handleKeyPress = function (e) {
	            var text = _this.input.value.trim();
	            if (e.key === 'Enter' && !e.shiftKey) {
	                e.preventDefault();
	                _this.sendMessage(text);
	            }
	        };
	
	        _this.handleSendMessage = function () {
	            var text = _this.input.value.trim();
	            _this.sendMessage(text);
	        };
	
	        _this.toggleHumanMode = function () {
	            _this.setState({ humanMode: !_this.state.humanMode });
	        };
	
	        _this.isWithinWorkingHours = function () {
	            var conf = _this.props.conf;
	            if (!conf.workingHours || !conf.workingHours.enabled) {
	                return true; // Çalışma saatleri ayarlanmamışsa her zaman açık
	            }
	
	            var now = new Date();
	            var hours = now.getHours();
	            var minutes = now.getMinutes();
	            var currentTime = hours * 60 + minutes;
	
	            var _conf$workingHours$st = conf.workingHours.start.split(':').map(Number),
	                _conf$workingHours$st2 = _slicedToArray(_conf$workingHours$st, 2),
	                startHour = _conf$workingHours$st2[0],
	                startMin = _conf$workingHours$st2[1];
	
	            var _conf$workingHours$en = conf.workingHours.end.split(':').map(Number),
	                _conf$workingHours$en2 = _slicedToArray(_conf$workingHours$en, 2),
	                endHour = _conf$workingHours$en2[0],
	                endMin = _conf$workingHours$en2[1];
	
	            var startTime = startHour * 60 + startMin;
	            var endTime = endHour * 60 + endMin;
	
	            return currentTime >= startTime && currentTime < endTime;
	        };
	
	        _this.dismissOverlay = function () {
	            _this.setState({ overlayDismissed: true });
	        };
	
	        _this.sendMessage = function (text) {
	            if (text) {
	                text = text.replace(/\n{2,}/g, '\n');
	                // Sayfa bilgilerini topla
	                var pageUrl = void 0,
	                    pageTitle = void 0,
	                    referrer = void 0;
	                try {
	                    pageUrl = window.parent.location.href;
	                    pageTitle = window.parent.document.title;
	                    referrer = window.parent.document.referrer || '';
	                } catch (e) {
	                    pageUrl = 'https://' + _this.props.host;
	                    pageTitle = _this.props.host;
	                    referrer = '';
	                }
	
	                _this.socket.send({
	                    text: text,
	                    from: 'visitor',
	                    visitorName: _this.props.conf.visitorName,
	                    human_mode: _this.state.humanMode,
	                    messageSource: _this.state.humanMode ? 'live_support' : 'ai_bot',
	                    pageUrl: pageUrl,
	                    pageTitle: pageTitle,
	                    browserLang: navigator.language,
	                    referrer: referrer,
	                    userAgent: navigator.userAgent,
	                    timestamp: new Date().toISOString()
	                });
	
	                _this.input.value = '';
	
	                // AutoResponse disabled - was causing unwanted automated messages
	                /*
	                if (this.autoResponseState === 'pristine') {
	                    if (this.props.conf.autoResponse) {
	                        setTimeout(() => {
	                            this.writeToMessages({
	                                text: this.props.conf.autoResponse,
	                                from: 'admin',
	                            });
	                        }, 500);
	                    }
	                     if (this.props.conf.autoNoResponse) {
	                        this.autoResponseTimer = setTimeout(() => {
	                            this.writeToMessages({
	                                text: this.props.conf.autoNoResponse,
	                                from: 'admin',
	                            });
	                            this.autoResponseState = 'canceled';
	                        }, 60 * 1000);
	                    }
	                    this.autoResponseState = 'set';
	                }
	                */
	            }
	        };
	
	        _this.incomingMessage = function (msg) {
	            _this.writeToMessages(msg);
	            if (msg.from === 'admin') {
	                document.getElementById('messageSound').play();
	
	                // AutoResponse state management disabled
	                /*
	                if (this.autoResponseState === 'pristine') {
	                    this.autoResponseState = 'canceled';
	                } else if (this.autoResponseState === 'set') {
	                    this.autoResponseState = 'canceled';
	                    clearTimeout(this.autoResponseTimer);
	                }
	                */
	            }
	        };
	
	        _this.writeToMessages = function (msg) {
	            msg.time = msg.time ? new Date(msg.time) : new Date();
	
	            // Add to correct array based on active tab
	            if (_this.state.humanMode) {
	                _this.humanMessages.push(msg);
	                if (store.enabled) {
	                    try {
	                        store.set(_this.humanMessagesKey, _this.humanMessages);
	                    } catch (e) {
	                        console.log('failed to add message to human localStorage', e);
	                        store.set(_this.humanMessagesKey, []);
	                    }
	                }
	            } else {
	                _this.aiMessages.push(msg);
	                if (store.enabled) {
	                    try {
	                        store.set(_this.aiMessagesKey, _this.aiMessages);
	                    } catch (e) {
	                        console.log('failed to add message to AI localStorage', e);
	                        store.set(_this.aiMessagesKey, []);
	                    }
	                }
	            }
	
	            // Update display
	            _this.setState({
	                messages: _this.state.humanMode ? _this.humanMessages : _this.aiMessages
	            });
	        };
	
	        if (store.enabled) {
	            _this.aiMessagesKey = 'messages.ai' + '.' + props.chatId + '.' + props.host;
	            _this.humanMessagesKey = 'messages.human' + '.' + props.chatId + '.' + props.host;
	            _this.aiMessages = store.get(_this.aiMessagesKey) || [];
	            _this.humanMessages = store.get(_this.humanMessagesKey) || [];
	        } else {
	            _this.aiMessages = [];
	            _this.humanMessages = [];
	        }
	
	        _this.state.isMobile = _this.isMobileDevice();
	        // Premium chat için AI mode default (human_mode false)
	        _this.state.humanMode = false;
	        _this.state.overlayDismissed = false;
	
	        // Show messages from active tab
	        _this.state.messages = _this.state.humanMode ? _this.humanMessages : _this.aiMessages;
	        return _this;
	    }
	
	    _createClass(Chat, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            var _this2 = this;
	
	            this.socket = _socket2.default.connect();
	            this.socket.on('connect', function () {
	                _this2.socket.emit('register', { chatId: _this2.props.chatId, userId: _this2.props.userId, CustomData: _this2.props.CustomData, helpMsg: _this2.props.conf.helpMessage });
	            });
	            this.socket.on(this.props.chatId, this.incomingMessage);
	            this.socket.on(this.props.chatId + '-' + this.props.userId, this.incomingMessage);
	
	            // AI Bot intro message
	            if (!this.aiMessages.length && this.props.conf.aiIntroMessage) {
	                this.aiMessages.push({ text: this.props.conf.aiIntroMessage, from: 'admin', time: new Date() });
	                if (store.enabled) {
	                    store.set(this.aiMessagesKey, this.aiMessages);
	                }
	            }
	
	            // Live Support intro message
	            if (!this.humanMessages.length && this.props.conf.introMessage) {
	                this.humanMessages.push({ text: this.props.conf.introMessage, from: 'admin', time: new Date() });
	                if (store.enabled) {
	                    store.set(this.humanMessagesKey, this.humanMessages);
	                }
	            }
	
	            // Display active tab's messages
	            this.setState({
	                messages: this.state.humanMode ? this.humanMessages : this.aiMessages
	            });
	
	            // Refresh mesajını dinle
	            window.addEventListener('message', this.handleClearChat);
	        }
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	            window.removeEventListener('message', this.handleClearChat);
	        }
	    }, {
	        key: 'isMobileDevice',
	        value: function isMobileDevice() {
	            return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	            );
	        }
	
	        // CRITICAL: Switch tab function to load that tab's conversation history
	
	    }, {
	        key: 'render',
	        value: function render(_ref, state) {
	            var _this3 = this;
	
	            _objectDestructuringEmpty(_ref);
	
	            var inputEvent = state.isMobile ? null : this.handleKeyPress;
	
	            return (0, _preact.h)(
	                'div',
	                { 'class': 'wrapper', style: { position: 'relative' } },
	                (0, _preact.h)(_messageArea2.default, { messages: state.messages, conf: this.props.conf }),
	                (0, _preact.h)(
	                    'div',
	                    { style: {
	                            padding: '10px 20px 8px 20px',
	                            borderBottom: '1px solid #e8e8e8',
	                            position: 'relative',
	                            zIndex: 1001
	                        } },
	                    (0, _preact.h)(
	                        'div',
	                        { style: {
	                                display: 'flex',
	                                gap: '4px',
	                                backgroundColor: '#f2f2f7',
	                                borderRadius: '17px',
	                                padding: '2px',
	                                position: 'relative'
	                            } },
	                        (0, _preact.h)(
	                            'button',
	                            {
	                                type: 'button',
	                                onClick: function onClick() {
	                                    return _this3.switchTab(true);
	                                },
	                                style: {
	                                    flex: 1,
	                                    padding: '8px 14px',
	                                    border: 'none',
	                                    borderRadius: '14px',
	                                    backgroundColor: state.humanMode ? '#ffffff' : 'transparent',
	                                    color: state.humanMode ? '#1d1d1f' : '#86868b',
	                                    fontSize: '13px',
	                                    fontWeight: state.humanMode ? '600' : '500',
	                                    cursor: 'pointer',
	                                    transition: 'all 0.25s ease',
	                                    boxShadow: state.humanMode ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
	                                    whiteSpace: 'nowrap',
	                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
	                                }
	                            },
	                            '\uD83D\uDC64 Live Support'
	                        ),
	                        (0, _preact.h)(
	                            'button',
	                            {
	                                type: 'button',
	                                onClick: function onClick() {
	                                    return _this3.switchTab(false);
	                                },
	                                style: {
	                                    flex: 1,
	                                    padding: '8px 14px',
	                                    border: 'none',
	                                    borderRadius: '14px',
	                                    backgroundColor: !state.humanMode ? '#ffffff' : 'transparent',
	                                    color: !state.humanMode ? '#1d1d1f' : '#86868b',
	                                    fontSize: '13px',
	                                    fontWeight: !state.humanMode ? '600' : '500',
	                                    cursor: 'pointer',
	                                    transition: 'all 0.25s ease',
	                                    boxShadow: !state.humanMode ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
	                                    whiteSpace: 'nowrap',
	                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
	                                }
	                            },
	                            '\uD83E\uDD16 Photier AI Bot'
	                        )
	                    )
	                ),
	                (0, _preact.h)(
	                    'div',
	                    { 'class': 'input-area' },
	                    (0, _preact.h)('textarea', {
	                        'class': 'textarea',
	                        type: 'text',
	                        rows: '1',
	                        placeholder: this.props.conf.placeholderText,
	                        ref: function ref(input) {
	                            _this3.input = input;
	                        },
	                        onKeyPress: inputEvent
	                    }),
	                    (0, _preact.h)(
	                        'button',
	                        { type: 'button', onClick: this.handleSendMessage },
	                        (0, _preact.h)(
	                            'svg',
	                            {
	                                xmlns: 'http://www.w3.org/2000/svg',
	                                width: '1em',
	                                height: '1em',
	                                fill: 'blue',
	                                viewBox: '0 0 1024 1024'
	                            },
	                            (0, _preact.h)('path', {
	                                d: 'M110.9 558.2l147.3 64.5L682.7 391.1l-256 298.7 366.9 167.1a42.7 42.7 0 0 0 59.7-36.3l42.7-640a42.8 42.8 0 0 0-60.8-41.5l-725.3 341.4a42.8 42.8 0 0 0 1 77.7zM341.3 945.8l203.8-98.8L341.3 751.9z' })
	                        )
	                    )
	                ),
	                !this.isWithinWorkingHours() && !state.overlayDismissed && state.humanMode && (0, _preact.h)(
	                    'div',
	                    { style: {
	                            position: 'absolute',
	                            top: 0,
	                            left: 0,
	                            right: 0,
	                            bottom: 0,
	                            backgroundColor: 'rgba(252, 252, 252, 0.78)',
	                            backdropFilter: 'blur(3px)',
	                            display: 'flex',
	                            flexDirection: 'column',
	                            alignItems: 'center',
	                            justifyContent: 'flex-start',
	                            paddingTop: '80px',
	                            zIndex: 999,
	                            padding: '80px 30px 30px 30px',
	                            borderRadius: '12px'
	                        } },
	                    (0, _preact.h)(
	                        'div',
	                        { style: {
	                                textAlign: 'center',
	                                color: '#1d1d1f',
	                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
	                            } },
	                        (0, _preact.h)(
	                            'div',
	                            { style: {
	                                    fontSize: '48px',
	                                    marginBottom: '16px'
	                                } },
	                            '\uD83C\uDF19'
	                        ),
	                        (0, _preact.h)(
	                            'div',
	                            { style: {
	                                    fontSize: '18px',
	                                    fontWeight: '600',
	                                    marginBottom: '12px',
	                                    lineHeight: '1.4'
	                                } },
	                            'Outside Working Hours'
	                        ),
	                        (0, _preact.h)(
	                            'div',
	                            { style: {
	                                    fontSize: '14px',
	                                    color: '#6e6e73',
	                                    marginBottom: '24px',
	                                    lineHeight: '1.5',
	                                    maxWidth: '280px'
	                                } },
	                            'But would you like to try your luck? Maybe an assistant is online.'
	                        ),
	                        (0, _preact.h)(
	                            'button',
	                            {
	                                type: 'button',
	                                onClick: this.dismissOverlay,
	                                style: {
	                                    padding: '12px 32px',
	                                    border: '2px solid #d1d1d6',
	                                    borderRadius: '14px',
	                                    backgroundColor: 'transparent',
	                                    color: '#1d1d1f',
	                                    fontSize: '14px',
	                                    fontWeight: '600',
	                                    cursor: 'pointer',
	                                    transition: 'all 0.2s ease',
	                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
	                                },
	                                onMouseEnter: function onMouseEnter(e) {
	                                    e.currentTarget.style.backgroundColor = '#f5f5f7';
	                                    e.currentTarget.style.borderColor = '#86868b';
	                                },
	                                onMouseLeave: function onMouseLeave(e) {
	                                    e.currentTarget.style.backgroundColor = 'transparent';
	                                    e.currentTarget.style.borderColor = '#d1d1d6';
	                                }
	                            },
	                            'Try Anyway'
	                        )
	                    )
	                )
	            );
	        }
	
	        // CRITICAL: Write to correct array based on active tab
	
	    }]);
	
	    return Chat;
	}(_preact.Component);
	
	exports.default = Chat;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _dateformat = __webpack_require__(37);
	
	var _dateformat2 = _interopRequireDefault(_dateformat);
	
	var _preact = __webpack_require__(1);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var dayInMillis = 60 * 60 * 24 * 1000;
	
	function parseMarkdown(text) {
	    if (!text || text.trim().length === 0) return '';
	
	    var lines = text.split('\n');
	    var html = '';
	    var inList = false;
	
	    lines.forEach(function (line) {
	        if (line.trim().match(/^[-*]\s/)) {
	            if (!inList) {
	                html += '<ul>';
	                inList = true;
	            }
	            var listItem = line.trim().replace(/^[-*]\s/, '');
	            listItem = listItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
	            html += '<li>' + listItem + '</li>';
	        } else {
	            if (inList) {
	                html += '</ul>';
	                inList = false;
	            }
	            if (line.trim()) {
	                var parsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
	                html += parsed + '<br />';
	            } else {
	                html += '<br />';
	            }
	        }
	    });
	
	    if (inList) {
	        html += '</ul>';
	    }
	
	    return html;
	}
	
	var MessageArea = function (_Component) {
	    _inherits(MessageArea, _Component);
	
	    function MessageArea() {
	        _classCallCheck(this, MessageArea);
	
	        return _possibleConstructorReturn(this, (MessageArea.__proto__ || Object.getPrototypeOf(MessageArea)).apply(this, arguments));
	    }
	
	    _createClass(MessageArea, [{
	        key: 'scrollToBottom',
	        value: function scrollToBottom() {
	            if (this.chat && 'scrollTo' in this.chat) {
	                this.chat.scrollTo({
	                    top: this.chat.scrollHeight - this.chat.clientHeight,
	                    behavior: 'smooth'
	                });
	            } else {
	                this.chat.scrollTop = this.chat.scrollHeight - this.chat.clientHeight;
	            }
	        }
	    }, {
	        key: 'focus',
	        value: function focus() {
	            this.chat.focus();
	        }
	    }, {
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            this.scrollToBottom();
	            this.focus();
	        }
	    }, {
	        key: 'componentDidUpdate',
	        value: function componentDidUpdate() {
	            this.scrollToBottom();
	            this.focus();
	        }
	    }, {
	        key: 'render',
	        value: function render(props, _ref) {
	            var _this2 = this;
	
	            _objectDestructuringEmpty(_ref);
	
	            var currentTime = new Date();
	
	            return (0, _preact.h)(
	                'div',
	                { 'class': 'chat', ref: function ref(el) {
	                        _this2.chat = el;
	                    } },
	                props.messages.filter(function (msg) {
	                    return msg.text && msg.text.trim().length > 0;
	                }).map(function (_ref2) {
	                    var name = _ref2.name,
	                        text = _ref2.text,
	                        from = _ref2.from,
	                        time = _ref2.time;
	
	                    return (0, _preact.h)(
	                        'div',
	                        { 'class': 'chat-message ' + from },
	                        (0, _preact.h)(
	                            'div',
	                            { 'class': 'msg' },
	                            (0, _preact.h)('p', { dangerouslySetInnerHTML: {
	                                    __html: parseMarkdown(text)
	                                } }),
	                            props.conf.displayMessageTime ? (0, _preact.h)(
	                                'div',
	                                { 'class': 'time' },
	                                currentTime - new Date(time) < dayInMillis ? (0, _dateformat2.default)(time, 'HH:MM') : (0, _dateformat2.default)(time, 'm/d/yy HH:MM')
	                            ) : ''
	                        )
	                    );
	                })
	            );
	        }
	    }]);
	
	    return MessageArea;
	}(_preact.Component);
	
	exports.default = MessageArea;

/***/ }),
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */
	
	(function(global) {
	  'use strict';
	
	  var dateFormat = (function() {
	      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
	      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
	      var timezoneClip = /[^-+\dA-Z]/g;
	  
	      // Regexes and supporting functions are cached through closure
	      return function (date, mask, utc, gmt) {
	  
	        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
	        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
	          mask = date;
	          date = undefined;
	        }
	  
	        date = date || new Date;
	  
	        if(!(date instanceof Date)) {
	          date = new Date(date);
	        }
	  
	        if (isNaN(date)) {
	          throw TypeError('Invalid date');
	        }
	  
	        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
	  
	        // Allow setting the utc/gmt argument via the mask
	        var maskSlice = mask.slice(0, 4);
	        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
	          mask = mask.slice(4);
	          utc = true;
	          if (maskSlice === 'GMT:') {
	            gmt = true;
	          }
	        }
	  
	        var _ = utc ? 'getUTC' : 'get';
	        var d = date[_ + 'Date']();
	        var D = date[_ + 'Day']();
	        var m = date[_ + 'Month']();
	        var y = date[_ + 'FullYear']();
	        var H = date[_ + 'Hours']();
	        var M = date[_ + 'Minutes']();
	        var s = date[_ + 'Seconds']();
	        var L = date[_ + 'Milliseconds']();
	        var o = utc ? 0 : date.getTimezoneOffset();
	        var W = getWeek(date);
	        var N = getDayOfWeek(date);
	        var flags = {
	          d:    d,
	          dd:   pad(d),
	          ddd:  dateFormat.i18n.dayNames[D],
	          dddd: dateFormat.i18n.dayNames[D + 7],
	          m:    m + 1,
	          mm:   pad(m + 1),
	          mmm:  dateFormat.i18n.monthNames[m],
	          mmmm: dateFormat.i18n.monthNames[m + 12],
	          yy:   String(y).slice(2),
	          yyyy: y,
	          h:    H % 12 || 12,
	          hh:   pad(H % 12 || 12),
	          H:    H,
	          HH:   pad(H),
	          M:    M,
	          MM:   pad(M),
	          s:    s,
	          ss:   pad(s),
	          l:    pad(L, 3),
	          L:    pad(Math.round(L / 10)),
	          t:    H < 12 ? 'a'  : 'p',
	          tt:   H < 12 ? 'am' : 'pm',
	          T:    H < 12 ? 'A'  : 'P',
	          TT:   H < 12 ? 'AM' : 'PM',
	          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
	          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
	          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
	          W:    W,
	          N:    N
	        };
	  
	        return mask.replace(token, function (match) {
	          if (match in flags) {
	            return flags[match];
	          }
	          return match.slice(1, match.length - 1);
	        });
	      };
	    })();
	
	  dateFormat.masks = {
	    'default':               'ddd mmm dd yyyy HH:MM:ss',
	    'shortDate':             'm/d/yy',
	    'mediumDate':            'mmm d, yyyy',
	    'longDate':              'mmmm d, yyyy',
	    'fullDate':              'dddd, mmmm d, yyyy',
	    'shortTime':             'h:MM TT',
	    'mediumTime':            'h:MM:ss TT',
	    'longTime':              'h:MM:ss TT Z',
	    'isoDate':               'yyyy-mm-dd',
	    'isoTime':               'HH:MM:ss',
	    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
	    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
	    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
	  };
	
	  // Internationalization strings
	  dateFormat.i18n = {
	    dayNames: [
	      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
	      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
	    ],
	    monthNames: [
	      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
	      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
	    ]
	  };
	
	function pad(val, len) {
	  val = String(val);
	  len = len || 2;
	  while (val.length < len) {
	    val = '0' + val;
	  }
	  return val;
	}
	
	/**
	 * Get the ISO 8601 week number
	 * Based on comments from
	 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
	 *
	 * @param  {Object} `date`
	 * @return {Number}
	 */
	function getWeek(date) {
	  // Remove time components of date
	  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	
	  // Change date to Thursday same week
	  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);
	
	  // Take January 4th as it is always in week 1 (see ISO 8601)
	  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
	
	  // Change date to Thursday same week
	  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
	
	  // Check if daylight-saving-time-switch occurred and correct for it
	  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
	  targetThursday.setHours(targetThursday.getHours() - ds);
	
	  // Number of weeks between target Thursday and first Thursday
	  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
	  return 1 + Math.floor(weekDiff);
	}
	
	/**
	 * Get ISO-8601 numeric representation of the day of the week
	 * 1 (for Monday) through 7 (for Sunday)
	 * 
	 * @param  {Object} `date`
	 * @return {Number}
	 */
	function getDayOfWeek(date) {
	  var dow = date.getDay();
	  if(dow === 0) {
	    dow = 7;
	  }
	  return dow;
	}
	
	/**
	 * kind-of shortcut
	 * @param  {*} val
	 * @return {String}
	 */
	function kindOf(val) {
	  if (val === null) {
	    return 'null';
	  }
	
	  if (val === undefined) {
	    return 'undefined';
	  }
	
	  if (typeof val !== 'object') {
	    return typeof val;
	  }
	
	  if (Array.isArray(val)) {
	    return 'array';
	  }
	
	  return {}.toString.call(val)
	    .slice(8, -1).toLowerCase();
	};
	
	
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return dateFormat;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    module.exports = dateFormat;
	  } else {
	    global.dateFormat = dateFormat;
	  }
	})(this);


/***/ }),
/* 38 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hasCORS = void 0;
	// imported from https://github.com/component/has-cors
	let value = false;
	try {
	    value = typeof XMLHttpRequest !== 'undefined' &&
	        'withCredentials' in new XMLHttpRequest();
	}
	catch (err) {
	    // if XMLHttp support is disabled in IE then it will throw
	    // when trying to create
	}
	exports.hasCORS = value;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Fetch = void 0;
	const polling_js_1 = __webpack_require__(20);
	/**
	 * HTTP long-polling based on the built-in `fetch()` method.
	 *
	 * Usage: browser, Node.js (since v18), Deno, Bun
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
	 * @see https://caniuse.com/fetch
	 * @see https://nodejs.org/api/globals.html#fetch
	 */
	class Fetch extends polling_js_1.Polling {
	    doPoll() {
	        this._fetch()
	            .then((res) => {
	            if (!res.ok) {
	                return this.onError("fetch read error", res.status, res);
	            }
	            res.text().then((data) => this.onData(data));
	        })
	            .catch((err) => {
	            this.onError("fetch read error", err);
	        });
	    }
	    doWrite(data, callback) {
	        this._fetch(data)
	            .then((res) => {
	            if (!res.ok) {
	                return this.onError("fetch write error", res.status, res);
	            }
	            callback();
	        })
	            .catch((err) => {
	            this.onError("fetch write error", err);
	        });
	    }
	    _fetch(data) {
	        var _a;
	        const isPost = data !== undefined;
	        const headers = new Headers(this.opts.extraHeaders);
	        if (isPost) {
	            headers.set("content-type", "text/plain;charset=UTF-8");
	        }
	        (_a = this.socket._cookieJar) === null || _a === void 0 ? void 0 : _a.appendCookies(headers);
	        return fetch(this.uri(), {
	            method: isPost ? "POST" : "GET",
	            body: isPost ? data : null,
	            headers,
	            credentials: this.opts.withCredentials ? "include" : "omit",
	        }).then((res) => {
	            var _a;
	            // @ts-ignore getSetCookie() was added in Node.js v19.7.0
	            (_a = this.socket._cookieJar) === null || _a === void 0 ? void 0 : _a.parseCookies(res.headers.getSetCookie());
	            return res;
	        });
	    }
	}
	exports.Fetch = Fetch;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */
	
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = __webpack_require__(41);
		createDebug.destroy = destroy;
	
		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});
	
		/**
		* The currently active debug mode names, and names to skip.
		*/
	
		createDebug.names = [];
		createDebug.skips = [];
	
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
	
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
	
			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}
	
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
	
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
	
			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}
	
				const self = debug;
	
				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
	
				args[0] = createDebug.coerce(args[0]);
	
				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}
	
				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);
	
						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});
	
				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);
	
				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}
	
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
	
			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
	
					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});
	
			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}
	
			return debug;
		}
	
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
	
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
	
			createDebug.names = [];
			createDebug.skips = [];
	
			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;
	
			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}
	
				namespaces = split[i].replace(/\*/g, '.*?');
	
				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}
	
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}
	
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}
	
			let i;
			let len;
	
			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}
	
			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}
	
			return false;
		}
	
		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}
	
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}
	
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	
		createDebug.enable(createDebug.load());
	
		return createDebug;
	}
	
	module.exports = setup;


/***/ }),
/* 41 */
/***/ (function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}


/***/ }),
/* 42 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decode = exports.encode = void 0;
	// imported from https://github.com/socketio/base64-arraybuffer
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// Use a lookup table to find the index.
	const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
	for (let i = 0; i < chars.length; i++) {
	    lookup[chars.charCodeAt(i)] = i;
	}
	const encode = (arraybuffer) => {
	    let bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
	    for (i = 0; i < len; i += 3) {
	        base64 += chars[bytes[i] >> 2];
	        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	        base64 += chars[bytes[i + 2] & 63];
	    }
	    if (len % 3 === 2) {
	        base64 = base64.substring(0, base64.length - 1) + '=';
	    }
	    else if (len % 3 === 1) {
	        base64 = base64.substring(0, base64.length - 2) + '==';
	    }
	    return base64;
	};
	exports.encode = encode;
	const decode = (base64) => {
	    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
	    if (base64[base64.length - 1] === '=') {
	        bufferLength--;
	        if (base64[base64.length - 2] === '=') {
	            bufferLength--;
	        }
	    }
	    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
	    for (i = 0; i < len; i += 4) {
	        encoded1 = lookup[base64.charCodeAt(i)];
	        encoded2 = lookup[base64.charCodeAt(i + 1)];
	        encoded3 = lookup[base64.charCodeAt(i + 2)];
	        encoded4 = lookup[base64.charCodeAt(i + 3)];
	        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	    }
	    return arraybuffer;
	};
	exports.decode = decode;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodePacket = void 0;
	const commons_js_1 = __webpack_require__(12);
	const base64_arraybuffer_js_1 = __webpack_require__(42);
	const withNativeArrayBuffer = typeof ArrayBuffer === "function";
	const decodePacket = (encodedPacket, binaryType) => {
	    if (typeof encodedPacket !== "string") {
	        return {
	            type: "message",
	            data: mapBinary(encodedPacket, binaryType),
	        };
	    }
	    const type = encodedPacket.charAt(0);
	    if (type === "b") {
	        return {
	            type: "message",
	            data: decodeBase64Packet(encodedPacket.substring(1), binaryType),
	        };
	    }
	    const packetType = commons_js_1.PACKET_TYPES_REVERSE[type];
	    if (!packetType) {
	        return commons_js_1.ERROR_PACKET;
	    }
	    return encodedPacket.length > 1
	        ? {
	            type: commons_js_1.PACKET_TYPES_REVERSE[type],
	            data: encodedPacket.substring(1),
	        }
	        : {
	            type: commons_js_1.PACKET_TYPES_REVERSE[type],
	        };
	};
	exports.decodePacket = decodePacket;
	const decodeBase64Packet = (data, binaryType) => {
	    if (withNativeArrayBuffer) {
	        const decoded = (0, base64_arraybuffer_js_1.decode)(data);
	        return mapBinary(decoded, binaryType);
	    }
	    else {
	        return { base64: true, data }; // fallback for old browsers
	    }
	};
	const mapBinary = (data, binaryType) => {
	    switch (binaryType) {
	        case "blob":
	            if (data instanceof Blob) {
	                // from WebSocket + binaryType "blob"
	                return data;
	            }
	            else {
	                // from HTTP long-polling or WebTransport
	                return new Blob([data]);
	            }
	        case "arraybuffer":
	        default:
	            if (data instanceof ArrayBuffer) {
	                // from HTTP long-polling (base64) or WebSocket + binaryType "arraybuffer"
	                return data;
	            }
	            else {
	                // from WebTransport (Uint8Array)
	                return data.buffer;
	            }
	    }
	};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodePacket = void 0;
	exports.encodePacketToBinary = encodePacketToBinary;
	const commons_js_1 = __webpack_require__(12);
	const withNativeBlob = typeof Blob === "function" ||
	    (typeof Blob !== "undefined" &&
	        Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
	const withNativeArrayBuffer = typeof ArrayBuffer === "function";
	// ArrayBuffer.isView method is not defined in IE10
	const isView = (obj) => {
	    return typeof ArrayBuffer.isView === "function"
	        ? ArrayBuffer.isView(obj)
	        : obj && obj.buffer instanceof ArrayBuffer;
	};
	const encodePacket = ({ type, data }, supportsBinary, callback) => {
	    if (withNativeBlob && data instanceof Blob) {
	        if (supportsBinary) {
	            return callback(data);
	        }
	        else {
	            return encodeBlobAsBase64(data, callback);
	        }
	    }
	    else if (withNativeArrayBuffer &&
	        (data instanceof ArrayBuffer || isView(data))) {
	        if (supportsBinary) {
	            return callback(data);
	        }
	        else {
	            return encodeBlobAsBase64(new Blob([data]), callback);
	        }
	    }
	    // plain string
	    return callback(commons_js_1.PACKET_TYPES[type] + (data || ""));
	};
	exports.encodePacket = encodePacket;
	const encodeBlobAsBase64 = (data, callback) => {
	    const fileReader = new FileReader();
	    fileReader.onload = function () {
	        const content = fileReader.result.split(",")[1];
	        callback("b" + (content || ""));
	    };
	    return fileReader.readAsDataURL(data);
	};
	function toArray(data) {
	    if (data instanceof Uint8Array) {
	        return data;
	    }
	    else if (data instanceof ArrayBuffer) {
	        return new Uint8Array(data);
	    }
	    else {
	        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	    }
	}
	let TEXT_ENCODER;
	function encodePacketToBinary(packet, callback) {
	    if (withNativeBlob && packet.data instanceof Blob) {
	        return packet.data.arrayBuffer().then(toArray).then(callback);
	    }
	    else if (withNativeArrayBuffer &&
	        (packet.data instanceof ArrayBuffer || isView(packet.data))) {
	        return callback(toArray(packet.data));
	    }
	    encodePacket(packet, false, (encoded) => {
	        if (!TEXT_ENCODER) {
	            TEXT_ENCODER = new TextEncoder();
	        }
	        callback(TEXT_ENCODER.encode(encoded));
	    });
	}


/***/ }),
/* 45 */
/***/ (function(module, exports) {

	/*jshint -W054 */
	;(function (exports) {
	  'use strict';
	
	  exports.humanReadableIds = exports.humanReadableIds || {};
	  exports.humanReadableIds.adjectives = ["afraid","ancient","angry","average","bad","big","bitter","black","blue","brave","breezy","bright","brown","calm","chatty","chilly","clever","cold","cowardly","cuddly","curly","curvy","dangerous","dry","dull","empty","evil","fast","fat","fluffy","foolish","fresh","friendly","funny","fuzzy","gentle","giant","good","great","green","grumpy","happy","hard","heavy","helpless","honest","horrible","hot","hungry","itchy","jolly","kind","lazy","light","little","loud","lovely","lucky","massive","mean","mighty","modern","moody","nasty","neat","nervous","new","nice","odd","old","orange","ordinary","perfect","pink","plastic","polite","popular","pretty","proud","purple","quick","quiet","rare","red","rotten","rude","selfish","serious","shaggy","sharp","short","shy","silent","silly","slimy","slippery","smart","smooth","soft","sour","spicy","splendid","spotty","stale","strange","strong","stupid","sweet","swift","tall","tame","tasty","tender","terrible","thin","tidy","tiny","tough","tricky","ugly","unlucky","warm","weak","wet","white","wicked","wise","witty","wonderful","yellow","young"];
	}('undefined' !== typeof exports && exports || new Function('return this')()));


/***/ }),
/* 46 */
/***/ (function(module, exports) {

	/*jshint -W054 */
	;(function (exports) {
	  'use strict';
	
	  exports.humanReadableIds = exports.humanReadableIds || {};
	  exports.humanReadableIds.animals = ["ape","baboon","badger","bat","bear","bird","bobcat","bulldog","bullfrog","cat","catfish","cheetah","chicken","chipmunk","cobra","cougar","cow","crab","deer","dingo","dodo","dog","dolphin","donkey","dragon","dragonfly","duck","eagle","earwig","eel","elephant","emu","falcon","fireant","firefox","fish","fly","fox","frog","gecko","goat","goose","grasshopper","horse","hound","husky","impala","insect","jellyfish","kangaroo","ladybug","liger","lion","lionfish","lizard","mayfly","mole","monkey","moose","moth","mouse","mule","newt","octopus","otter","owl","panda","panther","parrot","penguin","pig","puma","pug","quail","rabbit","rat","rattlesnake","robin","seahorse","sheep","shrimp","skunk","sloth","snail","snake","squid","starfish","stingray","swan","termite","tiger","treefrog","turkey","turtle","vampirebat","walrus","warthog","wasp","wolverine","wombat","yak","zebra"];
	}('undefined' !== typeof exports && exports || new Function('return this')()));


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	/*jshint -W054 */
	;(function (exports) {
	  'use strict';
	
	  var lists = exports.humanReadableIds || __webpack_require__(48)
	    , shuffle = exports.knuthShuffle || __webpack_require__(49).knuthShuffle
	    , animals = []
	    , adjectives = []
	    , numbers = []
	    ;
	
	  function genNumbers() {
	    var i = 2
	      ;
	
	    numbers = [];
	    numbers.push(0);
	    // 1 is not plural, so we skip it
	    for (i = 2; i <= 100; i += 1) {
	      numbers.push(i);
	    }
	
	    return shuffle(numbers);
	  }
	
	  function random() {
	    if (!adjectives.length) {
	      adjectives = shuffle(lists.adjectives.slice(0));
	    }
	    if (!animals.length) {
	      animals = shuffle(lists.animals.slice(0));
	    }
	    if (!numbers.length) {
	      numbers = shuffle(genNumbers());
	    }
	
	    return adjectives.pop()
	      + '-' + animals.pop()
	      + '-' + numbers.pop()
	      ;
	  }
	
	  exports.humanReadableIds = { random: random };
	  exports.hri = exports.humanReadableIds;
	
	}('undefined' !== typeof exports && exports || new Function('return this')()));


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = {
	  animals: __webpack_require__(46).humanReadableIds.animals
	, adjectives: __webpack_require__(45).humanReadableIds.adjectives
	};


/***/ }),
/* 49 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/*jshint -W054 */
	(function (exports) {
	  'use strict';
	
	  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	  function shuffle(array) {
	    var currentIndex = array.length
	      , temporaryValue
	      , randomIndex
	      ;
	
	    // While there remain elements to shuffle...
	    while (0 !== currentIndex) {
	
	      // Pick a remaining element...
	      randomIndex = Math.floor(Math.random() * currentIndex);
	      currentIndex -= 1;
	
	      // And swap it with the current element.
	      temporaryValue = array[currentIndex];
	      array[currentIndex] = array[randomIndex];
	      array[randomIndex] = temporaryValue;
	    }
	
	    return array;
	  }
	
	  exports.knuthShuffle = shuffle;
	}('undefined' !== typeof exports && exports || 'undefined' !== typeof window && window || global));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 50 */
/***/ (function(module, exports) {

	"use strict";
	/**
	 * Initialize backoff timer with `opts`.
	 *
	 * - `min` initial timeout in milliseconds [100]
	 * - `max` max timeout [10000]
	 * - `jitter` [0]
	 * - `factor` [2]
	 *
	 * @param {Object} opts
	 * @api public
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Backoff = Backoff;
	function Backoff(opts) {
	    opts = opts || {};
	    this.ms = opts.min || 100;
	    this.max = opts.max || 10000;
	    this.factor = opts.factor || 2;
	    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
	    this.attempts = 0;
	}
	/**
	 * Return the backoff duration.
	 *
	 * @return {Number}
	 * @api public
	 */
	Backoff.prototype.duration = function () {
	    var ms = this.ms * Math.pow(this.factor, this.attempts++);
	    if (this.jitter) {
	        var rand = Math.random();
	        var deviation = Math.floor(rand * this.jitter * ms);
	        ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
	    }
	    return Math.min(ms, this.max) | 0;
	};
	/**
	 * Reset the number of attempts.
	 *
	 * @api public
	 */
	Backoff.prototype.reset = function () {
	    this.attempts = 0;
	};
	/**
	 * Set the minimum duration
	 *
	 * @api public
	 */
	Backoff.prototype.setMin = function (min) {
	    this.ms = min;
	};
	/**
	 * Set the maximum duration
	 *
	 * @api public
	 */
	Backoff.prototype.setMax = function (max) {
	    this.max = max;
	};
	/**
	 * Set the jitter
	 *
	 * @api public
	 */
	Backoff.prototype.setJitter = function (jitter) {
	    this.jitter = jitter;
	};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebTransport = exports.WebSocket = exports.NodeWebSocket = exports.XHR = exports.NodeXHR = exports.Fetch = exports.Socket = exports.Manager = exports.protocol = void 0;
	exports.io = lookup;
	exports.connect = lookup;
	exports.default = lookup;
	const url_js_1 = __webpack_require__(53);
	const manager_js_1 = __webpack_require__(52);
	Object.defineProperty(exports, "Manager", { enumerable: true, get: function () { return manager_js_1.Manager; } });
	const socket_js_1 = __webpack_require__(23);
	Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_js_1.Socket; } });
	const debug_1 = __importDefault(__webpack_require__(8)); // debug()
	const debug = (0, debug_1.default)("socket.io-client"); // debug()
	/**
	 * Managers cache.
	 */
	const cache = {};
	function lookup(uri, opts) {
	    if (typeof uri === "object") {
	        opts = uri;
	        uri = undefined;
	    }
	    opts = opts || {};
	    const parsed = (0, url_js_1.url)(uri, opts.path || "/socket.io");
	    const source = parsed.source;
	    const id = parsed.id;
	    const path = parsed.path;
	    const sameNamespace = cache[id] && path in cache[id]["nsps"];
	    const newConnection = opts.forceNew ||
	        opts["force new connection"] ||
	        false === opts.multiplex ||
	        sameNamespace;
	    let io;
	    if (newConnection) {
	        debug("ignoring socket cache for %s", source);
	        io = new manager_js_1.Manager(source, opts);
	    }
	    else {
	        if (!cache[id]) {
	            debug("new io instance for %s", source);
	            cache[id] = new manager_js_1.Manager(source, opts);
	        }
	        io = cache[id];
	    }
	    if (parsed.query && !opts.query) {
	        opts.query = parsed.queryKey;
	    }
	    return io.socket(parsed.path, opts);
	}
	// so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
	// namespace (e.g. `io.connect(...)`), for backward compatibility
	Object.assign(lookup, {
	    Manager: manager_js_1.Manager,
	    Socket: socket_js_1.Socket,
	    io: lookup,
	    connect: lookup,
	});
	/**
	 * Protocol version.
	 *
	 * @public
	 */
	var socket_io_parser_1 = __webpack_require__(14);
	Object.defineProperty(exports, "protocol", { enumerable: true, get: function () { return socket_io_parser_1.protocol; } });
	var engine_io_client_1 = __webpack_require__(9);
	Object.defineProperty(exports, "Fetch", { enumerable: true, get: function () { return engine_io_client_1.Fetch; } });
	Object.defineProperty(exports, "NodeXHR", { enumerable: true, get: function () { return engine_io_client_1.NodeXHR; } });
	Object.defineProperty(exports, "XHR", { enumerable: true, get: function () { return engine_io_client_1.XHR; } });
	Object.defineProperty(exports, "NodeWebSocket", { enumerable: true, get: function () { return engine_io_client_1.NodeWebSocket; } });
	Object.defineProperty(exports, "WebSocket", { enumerable: true, get: function () { return engine_io_client_1.WebSocket; } });
	Object.defineProperty(exports, "WebTransport", { enumerable: true, get: function () { return engine_io_client_1.WebTransport; } });
	
	module.exports = lookup;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (this && this.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Manager = void 0;
	const engine_io_client_1 = __webpack_require__(9);
	const socket_js_1 = __webpack_require__(23);
	const parser = __importStar(__webpack_require__(14));
	const on_js_1 = __webpack_require__(22);
	const backo2_js_1 = __webpack_require__(50);
	const component_emitter_1 = __webpack_require__(2);
	const debug_1 = __importDefault(__webpack_require__(8)); // debug()
	const debug = (0, debug_1.default)("socket.io-client:manager"); // debug()
	class Manager extends component_emitter_1.Emitter {
	    constructor(uri, opts) {
	        var _a;
	        super();
	        this.nsps = {};
	        this.subs = [];
	        if (uri && "object" === typeof uri) {
	            opts = uri;
	            uri = undefined;
	        }
	        opts = opts || {};
	        opts.path = opts.path || "/socket.io";
	        this.opts = opts;
	        (0, engine_io_client_1.installTimerFunctions)(this, opts);
	        this.reconnection(opts.reconnection !== false);
	        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	        this.reconnectionDelay(opts.reconnectionDelay || 1000);
	        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
	        this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
	        this.backoff = new backo2_js_1.Backoff({
	            min: this.reconnectionDelay(),
	            max: this.reconnectionDelayMax(),
	            jitter: this.randomizationFactor(),
	        });
	        this.timeout(null == opts.timeout ? 20000 : opts.timeout);
	        this._readyState = "closed";
	        this.uri = uri;
	        const _parser = opts.parser || parser;
	        this.encoder = new _parser.Encoder();
	        this.decoder = new _parser.Decoder();
	        this._autoConnect = opts.autoConnect !== false;
	        if (this._autoConnect)
	            this.open();
	    }
	    reconnection(v) {
	        if (!arguments.length)
	            return this._reconnection;
	        this._reconnection = !!v;
	        if (!v) {
	            this.skipReconnect = true;
	        }
	        return this;
	    }
	    reconnectionAttempts(v) {
	        if (v === undefined)
	            return this._reconnectionAttempts;
	        this._reconnectionAttempts = v;
	        return this;
	    }
	    reconnectionDelay(v) {
	        var _a;
	        if (v === undefined)
	            return this._reconnectionDelay;
	        this._reconnectionDelay = v;
	        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
	        return this;
	    }
	    randomizationFactor(v) {
	        var _a;
	        if (v === undefined)
	            return this._randomizationFactor;
	        this._randomizationFactor = v;
	        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
	        return this;
	    }
	    reconnectionDelayMax(v) {
	        var _a;
	        if (v === undefined)
	            return this._reconnectionDelayMax;
	        this._reconnectionDelayMax = v;
	        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
	        return this;
	    }
	    timeout(v) {
	        if (!arguments.length)
	            return this._timeout;
	        this._timeout = v;
	        return this;
	    }
	    /**
	     * Starts trying to reconnect if reconnection is enabled and we have not
	     * started reconnecting yet
	     *
	     * @private
	     */
	    maybeReconnectOnOpen() {
	        // Only try to reconnect if it's the first time we're connecting
	        if (!this._reconnecting &&
	            this._reconnection &&
	            this.backoff.attempts === 0) {
	            // keeps reconnection from firing twice for the same reconnection loop
	            this.reconnect();
	        }
	    }
	    /**
	     * Sets the current transport `socket`.
	     *
	     * @param {Function} fn - optional, callback
	     * @return self
	     * @public
	     */
	    open(fn) {
	        debug("readyState %s", this._readyState);
	        if (~this._readyState.indexOf("open"))
	            return this;
	        debug("opening %s", this.uri);
	        this.engine = new engine_io_client_1.Socket(this.uri, this.opts);
	        const socket = this.engine;
	        const self = this;
	        this._readyState = "opening";
	        this.skipReconnect = false;
	        // emit `open`
	        const openSubDestroy = (0, on_js_1.on)(socket, "open", function () {
	            self.onopen();
	            fn && fn();
	        });
	        const onError = (err) => {
	            debug("error");
	            this.cleanup();
	            this._readyState = "closed";
	            this.emitReserved("error", err);
	            if (fn) {
	                fn(err);
	            }
	            else {
	                // Only do this if there is no fn to handle the error
	                this.maybeReconnectOnOpen();
	            }
	        };
	        // emit `error`
	        const errorSub = (0, on_js_1.on)(socket, "error", onError);
	        if (false !== this._timeout) {
	            const timeout = this._timeout;
	            debug("connect attempt will timeout after %d", timeout);
	            // set timer
	            const timer = this.setTimeoutFn(() => {
	                debug("connect attempt timed out after %d", timeout);
	                openSubDestroy();
	                onError(new Error("timeout"));
	                socket.close();
	            }, timeout);
	            if (this.opts.autoUnref) {
	                timer.unref();
	            }
	            this.subs.push(() => {
	                this.clearTimeoutFn(timer);
	            });
	        }
	        this.subs.push(openSubDestroy);
	        this.subs.push(errorSub);
	        return this;
	    }
	    /**
	     * Alias for open()
	     *
	     * @return self
	     * @public
	     */
	    connect(fn) {
	        return this.open(fn);
	    }
	    /**
	     * Called upon transport open.
	     *
	     * @private
	     */
	    onopen() {
	        debug("open");
	        // clear old subs
	        this.cleanup();
	        // mark as open
	        this._readyState = "open";
	        this.emitReserved("open");
	        // add new subs
	        const socket = this.engine;
	        this.subs.push((0, on_js_1.on)(socket, "ping", this.onping.bind(this)), (0, on_js_1.on)(socket, "data", this.ondata.bind(this)), (0, on_js_1.on)(socket, "error", this.onerror.bind(this)), (0, on_js_1.on)(socket, "close", this.onclose.bind(this)), 
	        // @ts-ignore
	        (0, on_js_1.on)(this.decoder, "decoded", this.ondecoded.bind(this)));
	    }
	    /**
	     * Called upon a ping.
	     *
	     * @private
	     */
	    onping() {
	        this.emitReserved("ping");
	    }
	    /**
	     * Called with data.
	     *
	     * @private
	     */
	    ondata(data) {
	        try {
	            this.decoder.add(data);
	        }
	        catch (e) {
	            this.onclose("parse error", e);
	        }
	    }
	    /**
	     * Called when parser fully decodes a packet.
	     *
	     * @private
	     */
	    ondecoded(packet) {
	        // the nextTick call prevents an exception in a user-provided event listener from triggering a disconnection due to a "parse error"
	        (0, engine_io_client_1.nextTick)(() => {
	            this.emitReserved("packet", packet);
	        }, this.setTimeoutFn);
	    }
	    /**
	     * Called upon socket error.
	     *
	     * @private
	     */
	    onerror(err) {
	        debug("error", err);
	        this.emitReserved("error", err);
	    }
	    /**
	     * Creates a new socket for the given `nsp`.
	     *
	     * @return {Socket}
	     * @public
	     */
	    socket(nsp, opts) {
	        let socket = this.nsps[nsp];
	        if (!socket) {
	            socket = new socket_js_1.Socket(this, nsp, opts);
	            this.nsps[nsp] = socket;
	        }
	        else if (this._autoConnect && !socket.active) {
	            socket.connect();
	        }
	        return socket;
	    }
	    /**
	     * Called upon a socket close.
	     *
	     * @param socket
	     * @private
	     */
	    _destroy(socket) {
	        const nsps = Object.keys(this.nsps);
	        for (const nsp of nsps) {
	            const socket = this.nsps[nsp];
	            if (socket.active) {
	                debug("socket %s is still active, skipping close", nsp);
	                return;
	            }
	        }
	        this._close();
	    }
	    /**
	     * Writes a packet.
	     *
	     * @param packet
	     * @private
	     */
	    _packet(packet) {
	        debug("writing packet %j", packet);
	        const encodedPackets = this.encoder.encode(packet);
	        for (let i = 0; i < encodedPackets.length; i++) {
	            this.engine.write(encodedPackets[i], packet.options);
	        }
	    }
	    /**
	     * Clean up transport subscriptions and packet buffer.
	     *
	     * @private
	     */
	    cleanup() {
	        debug("cleanup");
	        this.subs.forEach((subDestroy) => subDestroy());
	        this.subs.length = 0;
	        this.decoder.destroy();
	    }
	    /**
	     * Close the current socket.
	     *
	     * @private
	     */
	    _close() {
	        debug("disconnect");
	        this.skipReconnect = true;
	        this._reconnecting = false;
	        this.onclose("forced close");
	    }
	    /**
	     * Alias for close()
	     *
	     * @private
	     */
	    disconnect() {
	        return this._close();
	    }
	    /**
	     * Called when:
	     *
	     * - the low-level engine is closed
	     * - the parser encountered a badly formatted packet
	     * - all sockets are disconnected
	     *
	     * @private
	     */
	    onclose(reason, description) {
	        var _a;
	        debug("closed due to %s", reason);
	        this.cleanup();
	        (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
	        this.backoff.reset();
	        this._readyState = "closed";
	        this.emitReserved("close", reason, description);
	        if (this._reconnection && !this.skipReconnect) {
	            this.reconnect();
	        }
	    }
	    /**
	     * Attempt a reconnection.
	     *
	     * @private
	     */
	    reconnect() {
	        if (this._reconnecting || this.skipReconnect)
	            return this;
	        const self = this;
	        if (this.backoff.attempts >= this._reconnectionAttempts) {
	            debug("reconnect failed");
	            this.backoff.reset();
	            this.emitReserved("reconnect_failed");
	            this._reconnecting = false;
	        }
	        else {
	            const delay = this.backoff.duration();
	            debug("will wait %dms before reconnect attempt", delay);
	            this._reconnecting = true;
	            const timer = this.setTimeoutFn(() => {
	                if (self.skipReconnect)
	                    return;
	                debug("attempting reconnect");
	                this.emitReserved("reconnect_attempt", self.backoff.attempts);
	                // check again for the case socket closed in above events
	                if (self.skipReconnect)
	                    return;
	                self.open((err) => {
	                    if (err) {
	                        debug("reconnect attempt error");
	                        self._reconnecting = false;
	                        self.reconnect();
	                        this.emitReserved("reconnect_error", err);
	                    }
	                    else {
	                        debug("reconnect success");
	                        self.onreconnect();
	                    }
	                });
	            }, delay);
	            if (this.opts.autoUnref) {
	                timer.unref();
	            }
	            this.subs.push(() => {
	                this.clearTimeoutFn(timer);
	            });
	        }
	    }
	    /**
	     * Called upon successful reconnect.
	     *
	     * @private
	     */
	    onreconnect() {
	        const attempt = this.backoff.attempts;
	        this._reconnecting = false;
	        this.backoff.reset();
	        this.emitReserved("reconnect", attempt);
	    }
	}
	exports.Manager = Manager;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.url = url;
	const engine_io_client_1 = __webpack_require__(9);
	const debug_1 = __importDefault(__webpack_require__(8)); // debug()
	const debug = (0, debug_1.default)("socket.io-client:url"); // debug()
	/**
	 * URL parser.
	 *
	 * @param uri - url
	 * @param path - the request path of the connection
	 * @param loc - An object meant to mimic window.location.
	 *        Defaults to window.location.
	 * @public
	 */
	function url(uri, path = "", loc) {
	    let obj = uri;
	    // default to window.location
	    loc = loc || (typeof location !== "undefined" && location);
	    if (null == uri)
	        uri = loc.protocol + "//" + loc.host;
	    // relative path support
	    if (typeof uri === "string") {
	        if ("/" === uri.charAt(0)) {
	            if ("/" === uri.charAt(1)) {
	                uri = loc.protocol + uri;
	            }
	            else {
	                uri = loc.host + uri;
	            }
	        }
	        if (!/^(https?|wss?):\/\//.test(uri)) {
	            debug("protocol-less url %s", uri);
	            if ("undefined" !== typeof loc) {
	                uri = loc.protocol + "//" + uri;
	            }
	            else {
	                uri = "https://" + uri;
	            }
	        }
	        // parse
	        debug("parse %s", uri);
	        obj = (0, engine_io_client_1.parse)(uri);
	    }
	    // make sure we treat `localhost:80` and `localhost` equally
	    if (!obj.port) {
	        if (/^(http|ws)$/.test(obj.protocol)) {
	            obj.port = "80";
	        }
	        else if (/^(http|ws)s$/.test(obj.protocol)) {
	            obj.port = "443";
	        }
	    }
	    obj.path = obj.path || "/";
	    const ipv6 = obj.host.indexOf(":") !== -1;
	    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
	    // define unique id
	    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
	    // define href
	    obj.href =
	        obj.protocol +
	            "://" +
	            host +
	            (loc && loc.port === obj.port ? "" : ":" + obj.port);
	    return obj;
	}


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */
	
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = __webpack_require__(55);
		createDebug.destroy = destroy;
	
		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});
	
		/**
		* The currently active debug mode names, and names to skip.
		*/
	
		createDebug.names = [];
		createDebug.skips = [];
	
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
	
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
	
			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}
	
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
	
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
	
			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}
	
				const self = debug;
	
				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
	
				args[0] = createDebug.coerce(args[0]);
	
				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}
	
				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);
	
						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});
	
				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);
	
				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}
	
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
	
			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
	
					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});
	
			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}
	
			return debug;
		}
	
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
	
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
	
			createDebug.names = [];
			createDebug.skips = [];
	
			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;
	
			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}
	
				namespaces = split[i].replace(/\*/g, '.*?');
	
				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}
	
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}
	
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}
	
			let i;
			let len;
	
			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}
	
			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}
	
			return false;
		}
	
		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}
	
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}
	
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	
		createDebug.enable(createDebug.load());
	
		return createDebug;
	}
	
	module.exports = setup;


/***/ }),
/* 55 */
/***/ (function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.reconstructPacket = exports.deconstructPacket = void 0;
	const is_binary_js_1 = __webpack_require__(24);
	/**
	 * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
	 *
	 * @param {Object} packet - socket.io event packet
	 * @return {Object} with deconstructed packet and list of buffers
	 * @public
	 */
	function deconstructPacket(packet) {
	    const buffers = [];
	    const packetData = packet.data;
	    const pack = packet;
	    pack.data = _deconstructPacket(packetData, buffers);
	    pack.attachments = buffers.length; // number of binary 'attachments'
	    return { packet: pack, buffers: buffers };
	}
	exports.deconstructPacket = deconstructPacket;
	function _deconstructPacket(data, buffers) {
	    if (!data)
	        return data;
	    if ((0, is_binary_js_1.isBinary)(data)) {
	        const placeholder = { _placeholder: true, num: buffers.length };
	        buffers.push(data);
	        return placeholder;
	    }
	    else if (Array.isArray(data)) {
	        const newData = new Array(data.length);
	        for (let i = 0; i < data.length; i++) {
	            newData[i] = _deconstructPacket(data[i], buffers);
	        }
	        return newData;
	    }
	    else if (typeof data === "object" && !(data instanceof Date)) {
	        const newData = {};
	        for (const key in data) {
	            if (Object.prototype.hasOwnProperty.call(data, key)) {
	                newData[key] = _deconstructPacket(data[key], buffers);
	            }
	        }
	        return newData;
	    }
	    return data;
	}
	/**
	 * Reconstructs a binary packet from its placeholder packet and buffers
	 *
	 * @param {Object} packet - event packet with placeholders
	 * @param {Array} buffers - binary buffers to put in placeholder positions
	 * @return {Object} reconstructed packet
	 * @public
	 */
	function reconstructPacket(packet, buffers) {
	    packet.data = _reconstructPacket(packet.data, buffers);
	    delete packet.attachments; // no longer useful
	    return packet;
	}
	exports.reconstructPacket = reconstructPacket;
	function _reconstructPacket(data, buffers) {
	    if (!data)
	        return data;
	    if (data && data._placeholder === true) {
	        const isIndexValid = typeof data.num === "number" &&
	            data.num >= 0 &&
	            data.num < buffers.length;
	        if (isIndexValid) {
	            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
	        }
	        else {
	            throw new Error("illegal attachments");
	        }
	    }
	    else if (Array.isArray(data)) {
	        for (let i = 0; i < data.length; i++) {
	            data[i] = _reconstructPacket(data[i], buffers);
	        }
	    }
	    else if (typeof data === "object") {
	        for (const key in data) {
	            if (Object.prototype.hasOwnProperty.call(data, key)) {
	                data[key] = _reconstructPacket(data[key], buffers);
	            }
	        }
	    }
	    return data;
	}


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/* eslint-env browser */
	
	/**
	 * This is the web browser implementation of `debug()`.
	 */
	
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
	
		return () => {
			if (!warned) {
				warned = true;
				console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
			}
		};
	})();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}
	
		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}
	
		let m;
	
		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);
	
		if (!this.useColors) {
			return;
		}
	
		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');
	
		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});
	
		args.splice(lastC, 0, c);
	}
	
	/**
	 * Invokes `console.debug()` when available.
	 * No-op when `console.debug` is not a "function".
	 * If `console.debug` is not available, falls back
	 * to `console.log`.
	 *
	 * @api public
	 */
	exports.log = console.debug || console.log || (() => {});
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	
		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = ({"NODE_ENV":"production"}).DEBUG;
		}
	
		return r;
	}
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}
	
	module.exports = __webpack_require__(58)(exports);
	
	const {formatters} = module.exports;
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */
	
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = __webpack_require__(59);
		createDebug.destroy = destroy;
	
		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});
	
		/**
		* The currently active debug mode names, and names to skip.
		*/
	
		createDebug.names = [];
		createDebug.skips = [];
	
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
	
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
	
			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}
	
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
	
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
	
			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}
	
				const self = debug;
	
				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
	
				args[0] = createDebug.coerce(args[0]);
	
				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}
	
				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);
	
						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});
	
				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);
	
				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}
	
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
	
			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
	
					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});
	
			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}
	
			return debug;
		}
	
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
	
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
	
			createDebug.names = [];
			createDebug.skips = [];
	
			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;
	
			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}
	
				namespaces = split[i].replace(/\*/g, '.*?');
	
				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}
	
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}
	
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}
	
			let i;
			let len;
	
			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}
	
			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}
	
			return false;
		}
	
		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}
	
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}
	
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	
		createDebug.enable(createDebug.load());
	
		return createDebug;
	}
	
	module.exports = setup;


/***/ }),
/* 59 */
/***/ (function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}


/***/ })
/******/ ]);
//# sourceMappingURL=chat.js.map