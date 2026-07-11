import { execSync } from "child_process";

const PORT = Number(process.argv[2] ?? 3000);

function freePort(port) {
  if (process.platform !== "win32") {
    try {
      const pid = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
      if (pid) {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`Freed port ${port} (stopped PID ${pid})`);
      }
    } catch {
      // Port is already free.
    }
    return;
  }

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && pid !== "0") pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
        console.log(`Freed port ${port} (stopped PID ${pid})`);
      } catch {
        // Process may have already exited.
      }
    }
  } catch {
    // Port is already free.
  }
}

freePort(PORT);
