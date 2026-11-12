// Runs the API and web dev servers side by side with prefixed output (no extra dependencies).
import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const apps = [
  { name: 'api', color: '\x1b[35m', args: ['run', 'start:dev', '--prefix', 'api'] },
  { name: 'web', color: '\x1b[36m', args: ['run', 'dev', '--prefix', 'web'] },
];

const children = apps.map(({ name, color, args }) => {
  const isWindows = process.platform === 'win32';
  // detached => own process group, so we can stop the whole tree (npm -> nest/next -> node).
  const child = spawn(npm, args, { env: process.env, shell: isWindows, detached: !isWindows });
  const prefix = `${color}[${name}]\x1b[0m `;
  const pipe = (stream, out) =>
    stream.on('data', (chunk) =>
      chunk.toString().split('\n').filter(Boolean).forEach((line) => out.write(prefix + line + '\n')),
    );
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    console.log(`${prefix}exited with code ${code}`);
    shutdown(code ?? 0);
  });
  return child;
});

let stopping = false;
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  children.forEach((c) => {
    try {
      if (process.platform === 'win32') c.kill('SIGTERM');
      else process.kill(-c.pid, 'SIGTERM');
    } catch {
      // already exited
    }
  });
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
