const readline = require('readline-sync');

const AWS_RESERVED = 5;

// ---------- Input helpers ----------
function askCidr(label) {
  while (true) {
    const raw = readline.question(`${label} (e.g., /16): `).trim();
    const match = raw.match(/^\/?(\d{1,2})$/);
    if (match) {
      const cidr = parseInt(match[1], 10);
      if (cidr >= 16 && cidr <= 30) return cidr;
    }
    console.log('  That CIDR isnt allowed. Use a value from /16 to /30.');
  }
}

function askPositiveInt(label) {
  while (true) {
    const raw = readline.question(label).trim();
    if (/^\d+$/.test(raw) && parseInt(raw, 10) > 0) return parseInt(raw, 10);
    console.log('  Invalid input. Enter a positive whole number.');
  }
}

function askNumber(label) {
  while (true) {
    const raw = readline.question(label).trim().replace(/[$,]/g, '');
    if (raw !== '' && !isNaN(raw) && Number(raw) >= 0) return Number(raw);
    console.log('  Invalid input. Enter a number of 0 or more.');
  }
}

function askNonEmpty(label) {
  while (true) {
    const raw = readline.question(label).trim();
    if (raw) return raw;
    console.log('  Input cannot be empty.');
  }
}

function askYesNo(label) {
  while (true) {
    const raw = readline.question(label).trim().toLowerCase();
    if (['yes', 'y'].includes(raw)) return true;
    if (['no', 'n'].includes(raw)) return false;
    console.log('  Please answer yes or no.');
  }
}

// ---------- Part A: Subnet Host Checker ----------
function subnetHostChecker() {
  console.log('\n--- Subnet Host Checker ---');
  const vpc = askCidr('VPC CIDR');
  const subnet = askCidr('Subnet CIDR');
  const devices = askPositiveInt('Number of devices required: ');

  // Subnet must be the same size as or smaller than the VPC (prefix >= VPC prefix)
  const consistent = subnet >= vpc;
  console.log(`\nVPC: /${vpc}   Subnet: /${subnet}   Devices: ${devices}`);

  if (!consistent) {
    console.log(`Consistency: NO - a /${subnet} subnet is larger than the /${vpc} VPC, so it cannot fit inside it.`);
    return;
  }
  console.log(`Consistency: YES - a /${subnet} subnet fits inside a /${vpc} VPC.`);

  const total = Math.pow(2, 32 - subnet);
  const usable = Math.max(0, total - AWS_RESERVED);
  console.log(`Total addresses: ${total}, usable after AWS reserves ${AWS_RESERVED}: ${usable}`);

  if (usable >= devices) {
    console.log(`Sufficient: YES - ${usable - devices} unused IP addresses.`);
  } else {
    console.log(`Sufficient: NO - ${devices - usable} additional IP addresses needed.`);
  }
}

// ---------- Part B: Compute Environment Selector ----------
function computeSelector() {
  console.log('\n--- Compute Environment Selector ---');
  const name = askNonEmpty('Application name: ');
  const users = askPositiveInt('Monthly users: ');
  const budget = askNumber('Monthly budget ($): ');
  const ha = askYesNo('High availability required? (yes/no): ');

  let level; // 1 = single EC2, 2 = + LB, 3 = + ASG
  let recommendation;
  if (users > 10000 || ha) {
    level = 3;
    recommendation = 'EC2 + Load Balancer + Auto Scaling';
  } else if (users >= 1000) {
    level = 2;
    recommendation = 'EC2 + Load Balancer';
  } else {
    level = 1;
    recommendation = 'Single EC2';
  }

  console.log(`\nApplication: ${name}`);
  console.log(`Recommended architecture: ${recommendation}`);

  if (budget < 1000 && level > 1) {
    console.log('WARNING: Budget under $1,000 may not cover more than a single EC2 instance.');
  } else if (budget >= 1000 && budget <= 3000 && level === 3) {
    console.log('WARNING: Budget of $1,000-$3,000 may not cover Auto Scaling.');
  }
}

// ---------- Main loop ----------
function main() {
  console.log('=== Infrastructure Decision Tool ===');
  let running = true;
  while (running) {
    console.log('\n1. Subnet Host Checker');
    console.log('2. Compute Environment Selector');
    const choice = readline.question('Choose a tool (1 or 2): ').trim();

    if (choice === '1') subnetHostChecker();
    else if (choice === '2') computeSelector();
    else {
      console.log('  Invalid choice. Enter 1 or 2.');
      continue;
    }
    running = askYesNo('\nRun another tool? (yes/no): ');
  }
  console.log('Goodbye!');
}

main();
