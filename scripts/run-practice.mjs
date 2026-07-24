import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const practiceDir = join(root, "practice");

function usage(exitCode = 1) {
  console.error("Usage: npm run practice -- <id>|--id <id> [--model <slug>]");
  console.error("Example: npm run practice -- 1");
  console.error("Example: npm run practice -- --id 1 --model anthropic/claude-3.5-haiku");
  process.exit(exitCode);
}

function parseArgs(argv) {
  let id = null;
  let model = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--id" || arg === "-n") {
      if (id !== null) {
        console.error("Practice id specified more than once");
        usage();
      }
      id = argv[++i];
      if (!id) {
        console.error("Missing value for --id");
        usage();
      }
      continue;
    }
    if (arg === "--model" || arg === "-m") {
      model = argv[++i];
      if (!model) {
        console.error("Missing value for --model");
        usage();
      }
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}`);
      usage();
    }
    if (id !== null) {
      console.error(`Unexpected argument: ${arg}`);
      usage();
    }
    id = arg;
  }

  return { id, model };
}

const { id: raw, model } = parseArgs(process.argv.slice(2));

if (!raw || !/^\d+$/.test(raw)) {
  usage();
}

const id = Number(raw);
const files = await readdir(practiceDir);
const match = files.find((f) => {
  const prefix = f.match(/^(\d+)-.*\.mjs$/);
  return prefix && Number(prefix[1]) === id;
});

if (!match) {
  console.error(`No practice file found for id "${raw}" in practice/`);
  process.exit(1);
}

const env = { ...process.env };
if (model) env.OPENROUTER_MODEL = model;

const child = spawn(process.execPath, [join(practiceDir, match)], {
  stdio: "inherit",
  cwd: root,
  env,
});

child.on("exit", (code) => process.exit(code ?? 1));
