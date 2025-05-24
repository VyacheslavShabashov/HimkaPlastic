"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertDescription = exports.AlertTitle = exports.Alert = exports.Separator = exports.Badge = exports.TabsContent = exports.TabsTrigger = exports.TabsList = exports.Tabs = exports.Progress = exports.SelectItem = exports.SelectContent = exports.SelectValue = exports.SelectTrigger = exports.Select = exports.Input = exports.Label = exports.CardDescription = exports.CardFooter = exports.CardContent = exports.CardTitle = exports.CardHeader = exports.Card = exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// Button component
const Button = (_a) => {
    var { children, variant, size } = _a, props = __rest(_a, ["children", "variant", "size"]);
    return ((0, jsx_runtime_1.jsx)("button", Object.assign({}, props, { children: children })));
};
exports.Button = Button;
// Card components
const Card = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.Card = Card;
const CardHeader = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.CardHeader = CardHeader;
const CardTitle = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("h3", Object.assign({}, props, { children: children })));
};
exports.CardTitle = CardTitle;
const CardContent = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.CardContent = CardContent;
const CardFooter = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.CardFooter = CardFooter;
const CardDescription = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.CardDescription = CardDescription;
// Form components
const Label = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("label", Object.assign({}, props, { children: children })));
};
exports.Label = Label;
const Input = (props) => ((0, jsx_runtime_1.jsx)("input", Object.assign({}, props)));
exports.Input = Input;
// Select components
const Select = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("select", Object.assign({}, props, { children: children })));
};
exports.Select = Select;
const SelectTrigger = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.SelectTrigger = SelectTrigger;
const SelectValue = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.SelectValue = SelectValue;
const SelectContent = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.SelectContent = SelectContent;
const SelectItem = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.SelectItem = SelectItem;
// Progress component
const Progress = (_a) => {
    var { value, max } = _a, props = __rest(_a, ["value", "max"]);
    return ((0, jsx_runtime_1.jsx)("progress", Object.assign({ value: value, max: max }, props)));
};
exports.Progress = Progress;
// Tabs components
const Tabs = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.Tabs = Tabs;
const TabsList = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.TabsList = TabsList;
const TabsTrigger = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.TabsTrigger = TabsTrigger;
const TabsContent = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { children: children })));
};
exports.TabsContent = TabsContent;
// Badge component
const Badge = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("span", Object.assign({}, props, { children: children })));
};
exports.Badge = Badge;
// Separator component
const Separator = (_a) => {
    var props = __rest(_a, []);
    return (0, jsx_runtime_1.jsx)("hr", Object.assign({}, props));
};
exports.Separator = Separator;
// Alert components
const Alert = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "alert" }, props, { children: children })));
};
exports.Alert = Alert;
const AlertTitle = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("h4", Object.assign({}, props, { children: children })));
};
exports.AlertTitle = AlertTitle;
const AlertDescription = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return ((0, jsx_runtime_1.jsx)("p", Object.assign({}, props, { children: children })));
};
exports.AlertDescription = AlertDescription;
