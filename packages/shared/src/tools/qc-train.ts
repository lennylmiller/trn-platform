/**
 * Execute qc-train.sh commands via the SHELL_WRAPPER env var.
 * Used by both the MCP server and chat-server.
 */
import { spawn } from 'child_process';

const ALLOWED_COMMANDS = new Set([
  'setup', 'teardown', 'reset',
  'status', 'verify',
  'scenario', 'sync',
  'init', 'reset-db',
  'help',
]);

/**
 * Run a qc-train.sh command and return the collected output.
 * Validates the base command against a whitelist.
 */
export async function qcTrain(command: string): Promise<string> {
  const wrapper = process.env.SHELL_WRAPPER;
  if (!wrapper) {
    throw new Error(
      'SHELL_WRAPPER environment variable is not set. ' +
      'Set it to the path of qc-train.sh to use this tool.'
    );
  }

  // Validate base command against whitelist
  const baseCommand = command.trim().split(/\s+/)[0];
  if (!baseCommand || !ALLOWED_COMMANDS.has(baseCommand)) {
    throw new Error(
      `Unknown command: "${baseCommand}". ` +
      `Allowed: ${[...ALLOWED_COMMANDS].join(', ')}`
    );
  }

  const fullCommand = `${wrapper} ${command}`;

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];

    const child = spawn('bash', ['-c', fullCommand], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    child.stdout?.on('data', (chunk: Buffer) => {
      chunks.push(chunk.toString());
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      chunks.push(chunk.toString());
    });

    child.on('close', (exitCode) => {
      const output = chunks.join('');
      // Strip ANSI color codes for clean text output
      const cleaned = output.replace(
        // eslint-disable-next-line no-control-regex
        /\x1b\[[0-9;]*m/g,
        '',
      );

      if (exitCode === 0) {
        resolve(cleaned);
      } else {
        resolve(`[exit code ${exitCode}]\n${cleaned}`);
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to execute qc-train: ${err.message}`));
    });
  });
}
