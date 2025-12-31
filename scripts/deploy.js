#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENVIRONMENTS = {
  staging: {
    name: 'staging',
    domain: 'staging.yourdomain.com',
    branch: 'staging',
    dockerTag: 'staging-latest'
  },
  production: {
    name: 'production',
    domain: 'yourdomain.com',
    branch: 'main',
    dockerTag: 'latest'
  }
};

class Deployer {
  constructor(environment) {
    this.env = ENVIRONMENTS[environment];
    if (!this.env) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    
    this.startTime = Date.now();
    this.success = false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  async confirmDeployment() {
    return new Promise((resolve) => {
      rl.question(`Deploy to ${this.env.name}? (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  async runCommand(command, options = {}) {
    this.log(`Running: ${command}`);
    
    try {
      const output = execSync(command, {
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: options.cwd || process.cwd()
      });
      
      if (options.returnOutput) {
        return output.trim();
      }
      
      return true;
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    const requiredCommands = ['git', 'docker', 'kubectl', 'helm'];
    
    for (const cmd of requiredCommands) {
      try {
        execSync(`which ${cmd}`, { stdio: 'pipe' });
        this.log(`✓ ${cmd} found`);
      } catch {
        throw new Error(`${cmd} is required but not found`);
      }
    }
    
    // Check if we're on the right branch
    const currentBranch = await this.runCommand(
      'git rev-parse --abbrev-ref HEAD',
      { returnOutput: true, silent: true }
    );
    
    if (currentBranch !== this.env.branch) {
      this.log(`Warning: Not on ${this.env.branch} branch (currently on ${currentBranch})`, 'warning');
    }
    
    // Check for uncommitted changes
    const status = await this.runCommand(
      'git status --porcelain',
      { returnOutput: true, silent: true }
    );
    
    if (status) {
      this.log('Warning: There are uncommitted changes', 'warning');
    }
  }

  async runTests() {
    this.log('Running tests...');
    
    await this.runCommand('pnpm test');
    await this.runCommand('pnpm test:e2e');
    
    this.log('✓ All tests passed');
  }

  async buildImages() {
    this.log('Building Docker images...');
    
    const tag = `${process.env.DOCKER_REGISTRY}/devstore:${this.env.dockerTag}`;
    const tagCommit = `${process.env.DOCKER_REGISTRY}/devstore:${process.env.COMMIT_SHA}`;
    
    // Build API
    await this.runCommand(
      `docker build -t ${tag}-api -f Dockerfile.api .`
    );
    await this.runCommand(
      `docker tag ${tag}-api ${tagCommit}-api`
    );
    
    // Build Web
    await this.runCommand(
      `docker build -t ${tag}-web -f Dockerfile.web .`
    );
    await this.runCommand(
      `docker tag ${tag}-web ${tagCommit}-web`
    );
    
    this.log('✓ Images built successfully');
  }

  async pushImages() {
    this.log('Pushing images to registry...');
    
    await this.runCommand(
      `docker push ${process.env.DOCKER_REGISTRY}/devstore:${this.env.dockerTag}-api`
    );
    await this.runCommand(
      `docker push ${process.env.DOCKER_REGISTRY}/devstore:${process.env.COMMIT_SHA}-api`
    );
    
    await this.runCommand(
      `docker push ${process.env.DOCKER_REGISTRY}/devstore:${this.env.dockerTag}-web`
    );
    await this.runCommand(
      `docker push ${process.env.DOCKER_REGISTRY}/devstore:${process.env.COMMIT_SHA}-web`
    );
    
    this.log('✓ Images pushed successfully');
  }

  async deployToKubernetes() {
    this.log('Deploying to Kubernetes...');
    
    // Update deployment manifests with new image tag
    const manifestsDir = path.join(process.cwd(), 'k8s', this.env.name);
    
    // Apply configurations
    await this.runCommand(
      `kubectl apply -f ${manifestsDir}/namespace.yaml`
    );
    await this.runCommand(
      `kubectl apply -f ${manifestsDir}/configs/`
    );
    await this.runCommand(
      `kubectl apply -f ${manifestsDir}/secrets/`
    );
    
    // Update deployment image
    await this.runCommand(
      `kubectl set image deployment/api-service api=${process.env.DOCKER_REGISTRY}/devstore:${process.env.COMMIT_SHA}-api -n devstore`
    );
    await this.runCommand(
      `kubectl set image deployment/web-service web=${process.env.DOCKER_REGISTRY}/devstore:${process.env.COMMIT_SHA}-web -n devstore`
    );
    
    // Wait for rollout
    await this.runCommand(
      'kubectl rollout status deployment/api-service -n devstore --timeout=300s'
    );
    await this.runCommand(
      'kubectl rollout status deployment/web-service -n devstore --timeout=300s'
    );
    
    this.log('✓ Deployment successful');
  }

  async runMigrations() {
    this.log('Running database migrations...');
    
    await this.runCommand(
      `kubectl run migrations --image=${process.env.DOCKER_REGISTRY}/devstore:${process.env.COMMIT_SHA}-api -n devstore --restart=Never --command -- pnpm db:migrate`
    );
    
    // Wait for migration job to complete
    await this.runCommand(
      'kubectl wait --for=condition=complete job/migrations -n devstore --timeout=300s'
    );
    
    // Cleanup
    await this.runCommand(
      'kubectl delete job/migrations -n devstore'
    );
    
    this.log('✓ Migrations completed');
  }

  async runSmokeTests() {
    this.log('Running smoke tests...');
    
    const smokeTestScript = path.join(process.cwd(), 'scripts', 'smoke-test.js');
    
    if (fs.existsSync(smokeTestScript)) {
      await this.runCommand(`node ${smokeTestScript} ${this.env.domain}`);
      this.log('✓ Smoke tests passed');
    } else {
      this.log('No smoke tests found, skipping', 'warning');
    }
  }

  async cleanup() {
    this.log('Cleaning up old images...');
    
    // Keep only last 5 images
    const images = await this.runCommand(
      'docker images --filter "reference=*/devstore*" --format "{{.ID}} {{.CreatedAt}}"',
      { returnOutput: true, silent: true }
    );
    
    const imageList = images.split('\n')
      .map(line => {
        const [id, ...dateParts] = line.split(' ');
        return { id, date: new Date(dateParts.join(' ')) };
      })
      .sort((a, b) => b.date - a.date);
    
    const imagesToRemove = imageList.slice(5);
    
    for (const image of imagesToRemove) {
      try {
        await this.runCommand(`docker rmi ${image.id}`, { silent: true });
      } catch {
        // Ignore errors for images in use
      }
    }
    
    this.log('✓ Cleanup completed');
  }

  async notify() {
    this.log('Sending notifications...');
    
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const status = this.success ? 'successful' : 'failed';
    
    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      const payload = {
        text: `Deployment to ${this.env.name} ${status}!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Deployment to ${this.env.name} ${status}!*`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Environment:*\n${this.env.name}`
              },
              {
                type: 'mrkdwn',
                text: `*Duration:*\n${duration}s`
              },
              {
                type: 'mrkdwn',
                text: `*Branch:*\n${this.env.branch}`
              },
              {
                type: 'mrkdwn',
                text: `*Commit:*\n${process.env.COMMIT_SHA?.substring(0, 7) || 'unknown'}`
              }
            ]
          }
        ]
      };
      
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        this.log(`Failed to send Slack notification: ${error.message}`, 'warning');
      }
    }
  }

  async deploy() {
    try {
      // Setup
      process.env.COMMIT_SHA = await this.runCommand(
        'git rev-parse HEAD',
        { returnOutput: true, silent: true }
      );
      
      this.log(`Starting deployment to ${this.env.name}`);
      this.log(`Commit: ${process.env.COMMIT_SHA}`);
      
      // Confirmation
      const confirmed = await this.confirmDeployment();
      if (!confirmed) {
        this.log('Deployment cancelled by user');
        process.exit(0);
      }
      
      // Deployment steps
      await this.checkPrerequisites();
      await this.runTests();
      await this.buildImages();
      await this.pushImages();
      await this.deployToKubernetes();
      await this.runMigrations();
      await this.runSmokeTests();
      await this.cleanup();
      
      this.success = true;
      this.log(`✅ Deployment to ${this.env.name} completed successfully!`);
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      this.success = false;
      process.exit(1);
    } finally {
      await this.notify();
      rl.close();
      
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.log(`Total time: ${duration}s`);
    }
  }
}

// Main execution
const environment = process.argv[2];
if (!environment || !['staging', 'production'].includes(environment)) {
  console.error('Usage: node deploy.js <staging|production>');
  process.exit(1);
}

const deployer = new Deployer(environment);
deployer.deploy();