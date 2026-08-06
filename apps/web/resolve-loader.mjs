import { readFile } from "node:fs/promises";

const exts = [".js", ".jsx", ".mjs", ".cjs", "/index.js", "/index.jsx"];

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier.startsWith(".") &&
    !/\.[a-z0-9]+$/i.test(specifier) &&
    !context.parentURL.includes("node_modules")
  ) {
    for (const ext of exts) {
      try {
        return await nextResolve(specifier + ext, context);
      } catch {}
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const loaded = await nextLoad(url, context);
  if (typeof loaded.source === "string") {
    return loaded;
  }
  return loaded;
}