// import resolve from "@rollup/plugin-node-resolve";
// import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
// import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

// const packageJson = require("./package.json");

const FRAMEWORK = process.env.FRAMEWORK || "index";
const DECLARATIONS = process.env.DECLARATIONS || false;
const MIN = process.env.MIN || false;

const external = ["react", "process", "rollup-plugin-terser"];

function createOutput() {
  if (DECLARATIONS) {
    return {
      dir: "./dist",
      format: "esm",
    };
  }
  return {
    file: `./dist/${FRAMEWORK !== "index" ? FRAMEWORK + "/" : ""}index.${MIN ? "min.js" : "mjs"}`,
    format: "esm",
    sourcemap: true,
  };
}

const plugins = [
  typescript({
    tsconfig: "tsconfig.json",
    compilerOptions: DECLARATIONS
      ? {
          declaration: true,
          emitDeclarationOnly: true,
        }
      : {},
    rootDir: "./",
    outDir: `./dist`,
    include: ["./src/**/*"],
    exclude: ["./docs"],
  }),
];
if (MIN) {
  plugins.push(terser());
}

// export default [
//   {
//     input: "src/index.ts",
//     output: createOutput(),
//     plugins: [resolve(), commonjs(), typescript({ tsconfig: "./tsconfig.json" })],
//   },
//   {
//     input: "dist/esm/types/index.d.ts",
//     output: [{ file: "dist/index.d.ts", format: "esm" }],
//     plugins: [dts()],
//   },
// ];

export default {
  external,
  input: `./src/${FRAMEWORK === "index" ? "" : FRAMEWORK + "/"}index.ts`,
  output: createOutput(),
  plugins,
};
