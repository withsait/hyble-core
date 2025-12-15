const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

const config = {
  host: '178.63.138.97',
  username: 'hyble',
  password: '5%fvr3f_LKF3fN'
};

async function deploy() {
  console.log('Connecting to server...');

  try {
    await ssh.connect(config);
    console.log('Connected!');

    // Navigate to project and pull latest changes
    console.log('\n1. Pulling latest code...');
    let result = await ssh.execCommand('cd /home/hyble/apps/hyble-core && git pull origin main');
    console.log(result.stdout || result.stderr);

    // Install dependencies
    console.log('\n2. Installing dependencies...');
    result = await ssh.execCommand('cd /home/hyble/apps/hyble-core && pnpm install');
    console.log(result.stdout || result.stderr);

    // Generate Prisma client
    console.log('\n3. Generating Prisma client...');
    result = await ssh.execCommand('cd /home/hyble/apps/hyble-core && pnpm db:generate');
    console.log(result.stdout || result.stderr);

    // Build all apps
    console.log('\n4. Building all apps...');
    result = await ssh.execCommand('cd /home/hyble/apps/hyble-core && pnpm build', { execOptions: { timeout: 300000 } });
    console.log(result.stdout || result.stderr);

    // Restart PM2
    console.log('\n5. Restarting PM2 services...');
    result = await ssh.execCommand('pm2 restart all || pm2 start /home/hyble/apps/hyble-core/ecosystem.config.js');
    console.log(result.stdout || result.stderr);

    // Check status
    console.log('\n6. Checking PM2 status...');
    result = await ssh.execCommand('pm2 list');
    console.log(result.stdout || result.stderr);

    console.log('\n✅ Deployment completed successfully!');

  } catch (error) {
    console.error('Deployment failed:', error.message);
  } finally {
    ssh.dispose();
  }
}

deploy();
