import { spawn } from "child_process";

export const runServeo = (port: number) => {
    const cmd = process.platform === 'win32' ? 'ssh.exe' : 'ssh';

    const tunnel = spawn(cmd, [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-R', `80:localhost:${port}`,
        'serveo.net'
    ]);

    tunnel.stdout.on('data', (data) => {
        console.log(`[Serveo STDOUT]: ${data.toString()}`);
    });

    tunnel.stderr.on('data', (data) => {
        console.error(`[Serveo STDERR]: ${data.toString()}`);
    });

    tunnel.on('close', (code) => {
        console.log(`[Serveo] Tunnel closed with code ${code}`);
    });

    tunnel.on('error', (err) => {
        console.error(`[Serveo ERROR]: ${err}`);
    });
}

