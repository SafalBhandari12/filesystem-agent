import { tool } from "ai";
import { z } from "zod";
import type { Sandbox } from "@vercel/sandbox";

export function createBashTool(sandbox: Sandbox) {
  return tool({
    description: `
      Execute a bash command line to explore transcript and instruction files.
      Pipes, globs and redirects are supported.
      Examples (not exhaustive): ls, cat, less, head, tail, grep, find calls -type f | wc -l
      `,
    inputSchema: z.object({
      command: z
        .string()
        .describe("The full bash command line to execute, e.g. `ls -la calls`"),
    }),
    execute: async ({ command }) => {
      try {
        const result = await sandbox.runCommand("bash", ["-c", command]);
        return {
          stdout: await result.stdout(),
          stderr: await result.stderr(),
          exitCode: result.exitCode,
        };
      } catch (error) {
        return {
          stdout: "",
          stderr: error instanceof Error ? error.message : String(error),
          exitCode: 1,
        };
      }
    },
  });
}
