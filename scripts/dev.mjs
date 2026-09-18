import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

let stopping = false;
let apiProcess;
let viteProcess;

function startApi() {
  apiProcess = spawn(process.execPath, ['--env-file=.env', 'server.mjs'], { stdio: 'inherit' });
  apiProcess.on('exit', (code, signal) => {
    if (stopping) return;
    console.error(`API exited (${signal || `code ${code}`}); restarting in one second.`);
    setTimeout(startApi, 1_000);
  });
}

async function waitForApi() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch('http://localhost:4000/api/cms-state');
      if (response.ok) return;
    } catch {
      // The API is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.warn('API health check timed out; Vite will start and retry through its proxy.');
}

function stop() {
  stopping = true;
  apiProcess?.kill();
  viteProcess?.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

startApi();
await waitForApi();
viteProcess = spawn(process.execPath, [resolve('node_modules', 'vite', 'bin', 'vite.js')], { stdio: 'inherit' });
viteProcess.on('exit', (code) => {
  if (!stopping && code) process.exitCode = code;
});
