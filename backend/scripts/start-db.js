/**
 * Development helper script to verify and start PostgreSQL local cluster
 */
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const pgDataDir = path.resolve(__dirname, '..', 'pgdata');
const postgresBinDir = 'C:\\Program Files\\PostgreSQL\\18\\bin';
const pgIsReady = path.join(postgresBinDir, 'pg_isready.exe');
const postgresExe = path.join(postgresBinDir, 'postgres.exe');
const initdbExe = path.join(postgresBinDir, 'initdb.exe');
const createdbExe = path.join(postgresBinDir, 'createdb.exe');

function isReady(port = 5433) {
  try {
    execSync(`"${pgIsReady}" -p ${port}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking PostgreSQL status on port 5433...');

  if (isReady(5433)) {
    console.log('✅ PostgreSQL is already running and accepting connections on port 5433.');
    return;
  }

  // Check if data dir exists
  if (!fs.existsSync(pgDataDir)) {
    console.log('📦 Initializing PostgreSQL cluster in backend/pgdata...');
    execSync(`"${initdbExe}" -D "${pgDataDir}" -U postgres -A trust --no-locale`, { stdio: 'inherit' });
  }

  console.log('🚀 Launching PostgreSQL on port 5433...');
  const child = spawn(postgresExe, ['-D', pgDataDir, '-p', '5433'], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  // Wait for it to become ready
  let ready = false;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (isReady(5433)) {
      ready = true;
      break;
    }
  }

  if (ready) {
    console.log('✅ PostgreSQL successfully started on port 5433.');
    try {
      execSync(`"${createdbExe}" -p 5433 -U postgres store_rating_db`, { stdio: 'ignore' });
      console.log('✅ Database store_rating_db verified/created.');
    } catch {
      // Database already exists
    }
  } else {
    console.error('⚠️ Could not verify PostgreSQL startup on port 5433.');
  }
}

main().catch(console.error);
