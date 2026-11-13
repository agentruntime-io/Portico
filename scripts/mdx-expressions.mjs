/**
 * Finds MDX expressions that would throw a ReferenceError when the page renders.
 *
 * `{id}` in prose or a table cell (for example `/team/{id}/task`) is a JavaScript expression,
 * not text. It compiles fine, then fails at render time and the page returns a 500. This walks
 * the expressions that remark-mdx already parsed (`data.estree`, acorn) and reports identifiers
 * that nothing defines.
 *
 * An identifier counts as defined when it is: declared in the page (`import`, `export const`,
 * `export function`...), bound by the expression itself (arrow/function params, local `const`,
 * catch params), a JavaScript built-in (see GLOBALS), or `props` (MDX passes it to the page).
 * Portico's renderer (src/lib/mdx-pages.ts) passes components and no `scope`, so components are
 * not referenceable from expressions and do not count.
 */
import { visit } from "unist-util-visit";

/** Built-ins an expression can legitimately use; the page is evaluated where all of these exist. */
export const GLOBALS = new Set([
  "undefined", "NaN", "Infinity", "globalThis", "props",
  "Math", "Date", "JSON", "Number", "String", "Boolean", "BigInt", "Symbol", "Object",
  "Array", "Map", "Set", "WeakMap", "WeakSet", "RegExp", "Error", "Promise", "Intl",
  "parseInt", "parseFloat", "isNaN", "isFinite",
  "encodeURIComponent", "decodeURIComponent", "encodeURI", "decodeURI",
  "console", "arguments",
]);

/** Names bound by a declaration pattern (identifier, destructuring, rest, default). */
function patternNames(node, out) {
  if (!node) return;
  switch (node.type) {
    case "Identifier": out.add(node.name); break;
    case "ObjectPattern":
      for (const p of node.properties) patternNames(p.type === "RestElement" ? p.argument : p.value, out);
      break;
    case "ArrayPattern": for (const e of node.elements) patternNames(e, out); break;
    case "RestElement": patternNames(node.argument, out); break;
    case "AssignmentPattern": patternNames(node.left, out); break;
    default: break;
  }
}

function children(node) {
  const out = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "range" || key === "comments") continue;
    if (Array.isArray(value)) {
      for (const v of value) if (v && typeof v.type === "string") out.push([key, v]);
    } else if (value && typeof value.type === "string") out.push([key, value]);
  }
  return out;
}

/** Every name declared anywhere inside `node` (over-approximates scoping to avoid false positives). */
function declaredWithin(node, out) {
  if (!node || typeof node.type !== "string") return;
  switch (node.type) {
    case "VariableDeclarator": patternNames(node.id, out); break;
    case "FunctionDeclaration":
    case "ClassDeclaration":
      if (node.id) out.add(node.id.name);
      break;
    case "FunctionExpression":
    case "ClassExpression":
      if (node.id) out.add(node.id.name);
      break;
    case "ImportSpecifier":
    case "ImportDefaultSpecifier":
    case "ImportNamespaceSpecifier":
      out.add(node.local.name);
      break;
    case "CatchClause": patternNames(node.param, out); break;
    default: break;
  }
  if (/Function/.test(node.type)) for (const p of node.params ?? []) patternNames(p, out);
  for (const [, child] of children(node)) declaredWithin(child, out);
}

function collectUndefined(node, defined, found, parent, key) {
  if (!node || typeof node.type !== "string") return;
  if (node.type === "Identifier") {
    const isReference =
      !(parent?.type === "MemberExpression" && key === "property" && !parent.computed) &&
      !(parent?.type === "Property" && key === "key" && !parent.computed && !parent.shorthand) &&
      !((parent?.type === "MethodDefinition" || parent?.type === "PropertyDefinition") && key === "key" && !parent.computed) &&
      !((parent?.type === "LabeledStatement" || parent?.type === "BreakStatement" || parent?.type === "ContinueStatement") && key === "label");
    if (isReference && !defined.has(node.name) && !GLOBALS.has(node.name)) found.add(node.name);
    return;
  }
  for (const [childKey, child] of children(node)) collectUndefined(child, defined, found, node, childKey);
}

/** Identifier names an estree program/expression references without defining them. */
export function undefinedIdentifiers(estree, pageScope = new Set()) {
  const defined = new Set(pageScope);
  declaredWithin(estree, defined);
  const found = new Set();
  collectUndefined(estree, defined, found, null, null);
  return [...found];
}

/** Names declared by the page's own `import` / `export` statements. */
export function pageDeclarations(tree) {
  const names = new Set();
  visit(tree, "mdxjsEsm", (node) => {
    if (node.data?.estree) declaredWithin(node.data.estree, names);
  });
  return names;
}

/**
 * Problems for one parsed page: [{ line, expression, names }].
 * `tree` must come from unified().use(remarkParse).use(remarkMdx).
 */
export function findUndefinedExpressions(tree) {
  const scope = pageDeclarations(tree);
  const hits = [];
  const check = (estree, node, text) => {
    if (!estree) return;
    const names = undefinedIdentifiers(estree, scope);
    if (names.length) {
      hits.push({ line: node.position?.start.line ?? 1, expression: text, names });
    }
  };
  visit(tree, (node) => {
    if (node.type === "mdxTextExpression" || node.type === "mdxFlowExpression") {
      check(node.data?.estree, node, `{${node.value}}`);
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      for (const attr of node.attributes ?? []) {
        if (attr.type === "mdxJsxAttribute" && attr.value && typeof attr.value === "object") {
          check(attr.value.data?.estree, node, `${attr.name}={${attr.value.value}}`);
        } else if (attr.type === "mdxJsxExpressionAttribute") {
          check(attr.data?.estree, node, `{${attr.value}}`);
        }
      }
    }
  });
  return hits;
}
