import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import chalk from "chalk";
import { execa } from "execa";
import { execSync } from "child_process";
import prettyBytes from "pretty-bytes";

const info = (m) => console.log(chalk.blue(m));
const error = (m) => console.log(chalk.red(m));
const success = (m) => console.log(chalk.green(m));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname);
const isPublishing = process.argv[2] === "--publish";

function excecute() {
  execSync([...arguments].join(" "));
}

async function clean() {
  await execa("rm", ["-rf", `${rootDir}/dist`]);
}
async function build() {
  await execa("npx", ["rollup", "-c", "rollup.config.js", ...arguments]);
}
async function baseBuild() {
  info("Rolling up primary package");
  await build();
}

async function bundleDeclarations() {
  info("Bundling declarations");
  excecute("mv", "-v", `${rootDir}/dist/src/\*`, `${rootDir}/dist`);
  excecute("rm", "-rf", `${rootDir}/dist/src`);
  excecute("rm", `${rootDir}/dist/index.js`);
}

async function addPackageJSON() {
  info("Writing package.json");
  const raw = await fs.readFile(resolve(rootDir, "package.json"), "utf8");
  const packageJSON = JSON.parse(raw);
  packageJSON.main = "index.min.js";
  packageJSON.modules = "index.esm.js";
  packageJSON.types = "index.d.ts";
  packageJSON.exports = {
    ".": {
      import: "./index.mjs",
    },
  };
  delete packageJSON.files;
  delete packageJSON.private;
  delete packageJSON.devDependencies;
  delete packageJSON.scripts;
  await fs.writeFile(resolve(rootDir, "dist/package.json"), JSON.stringify(packageJSON, null, 2));
}

async function prepareForPublishing() {
  info("Preparing for publication");
  if (!/npm-cli\.js$/.test(process.env.npm_execpath)) {
    error(`⚠️ You must run this command with npm instead of yarn.`);
    info("Please try again with:\n\n» npm run publish\n\n");
    process.exit();
  }
  const isClean = !execSync(`git status --untracked-files=no --porcelain`, {
    encoding: "utf-8",
  });
  if (!isClean) {
    error("Commit your changes before publishing.");
    process.exit();
  }
  const raw = await fs.readFile(resolve(rootDir, "package.json"), "utf8");
  const packageJSON = JSON.parse(raw);
  const response = await prompts([
    {
      type: "confirm",
      name: "value",
      message: `Confirm you want to publish version ${chalk.red(packageJSON.version)}?`,
      initial: false,
    },
  ]);
  if (!response.value) {
    error("Please adjust the version and try again");
    process.exit();
  }
}

async function outputSize() {
  // const raw = await fs.readFile(resolve(rootDir, "dist/index.min.js"), "utf8");
  const { size } = await fs.stat(resolve(rootDir, "dist/index.min.js"));
  console.log("Brotli size: " + prettyBytes(size));
}

if (isPublishing) await prepareForPublishing();
await clean();
info("Rolling up primary package");
await build();

/**
 * Build minified version of the library
 */
info("Minifying primary package");
await build("--environment", "MIN:true");

/**
 * Build the declarations
 */
info("Outputting declarations");
await build("--environment", "DECLARATIONS:true");

/**
 * Bundle the declarations
 */
await bundleDeclarations();

await addPackageJSON();
await outputSize();
success("Build complete");
