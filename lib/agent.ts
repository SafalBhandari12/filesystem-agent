import { ToolLoopAgent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createBashTool } from "./tools";
import { Sandbox } from "@vercel/sandbox";

import path from "path";
import fs from "fs/promises";

const MODEL = "gpt-5.4-mini";

const azure = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // https://sahr67568-8803-resource.openai.azure.com/openai/v1
});

const INSTRUCTIONS = `
You are a helpful assistant that answers questions about customer calls. Use the bash tool to explore the files and find relevant information pertaining to the user's query. Using the information you find, craft a response for the user and output it as text.
`;

const sandbox = await Sandbox.create();

await loadSandboxFiles(sandbox);

async function loadSandboxFiles(sandbox: Sandbox) {
  const callsDir = path.join(process.cwd(), "lib", "calls");
  const callFiles = await fs.readdir(callsDir);

  for (const file of callFiles) {
    const filePath = path.join(callsDir, file);
    const buffer = await fs.readFile(filePath);
    await sandbox.writeFiles([{ path: `calls/${file}`, content: buffer }]);
  }
}

export const agent = new ToolLoopAgent({
  model: azure.chat(MODEL),
  instructions: INSTRUCTIONS,
  tools: {
    bash: createBashTool(sandbox),
  },
});
