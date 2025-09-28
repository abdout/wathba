#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

const MAX_RETRIES = 10;
let retryCount = 0;

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        log(`Running: ${command} ${args.join(' ')}`);
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function buildProject() {
    try {
        log('Starting build process...');
        await runCommand('npm', ['run', 'build']);
        log('✅ Build successful!');
        return true;
    } catch (error) {
        log(`❌ Build failed: ${error.message}`);
        return false;
    }
}

async function commitAndPush() {
    try {
        log('Checking git status...');

        // Check if there are any changes to commit
        try {
            await runCommand('git', ['diff', '--exit-code']);
            await runCommand('git', ['diff', '--cached', '--exit-code']);
            log('No changes to commit.');
            return true;
        } catch {
            // There are changes, proceed with commit
        }

        log('Adding changes to git...');
        await runCommand('git', ['add', '.']);

        log('Creating commit...');
        const commitMessage = `Auto-commit: Build successful at ${new Date().toISOString()}`;
        await runCommand('git', ['commit', '-m', commitMessage]);

        log('Pushing to GitHub...');
        await runCommand('git', ['push']);

        log('✅ Successfully pushed to GitHub!');
        return true;
    } catch (error) {
        log(`❌ Git operations failed: ${error.message}`);
        return false;
    }
}

async function main() {
    log('🚀 Starting automated build and push workflow...');
    log(`Maximum retries: ${MAX_RETRIES}`);

    while (retryCount < MAX_RETRIES) {
        retryCount++;
        log(`\n--- Attempt ${retryCount}/${MAX_RETRIES} ---`);

        const buildSuccess = await buildProject();

        if (buildSuccess) {
            log('Build passed! Proceeding with git operations...');

            const pushSuccess = await commitAndPush();
            if (pushSuccess) {
                log('🎉 Workflow completed successfully!');
                process.exit(0);
            } else {
                log('Git operations failed, but build was successful.');
                process.exit(1);
            }
        } else {
            if (retryCount < MAX_RETRIES) {
                log(`Build failed. Retrying in 5 seconds... (${retryCount}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                log('❌ Maximum retries reached. Build still failing.');
                process.exit(1);
            }
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\n🛑 Process interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    log('\n🛑 Process terminated');
    process.exit(1);
});

main().catch((error) => {
    log(`💥 Unexpected error: ${error.message}`);
    process.exit(1);
});