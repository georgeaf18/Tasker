# GitHub Actions Secrets Setup

This guide explains how to configure GitHub secrets for CI/CD pipelines.

## Required Secrets

### For Deployment Workflow

Navigate to: **Repository → Settings → Secrets and variables → Actions**

#### Production Environment

1. **PROD_HOST**
   - Description: Production server IP address or hostname
   - Example: `123.45.67.89` or `tasker.yourdomain.com`

2. **PROD_USER**
   - Description: SSH username for production server
   - Example: `deploy` or `ubuntu`

3. **PROD_SSH_KEY**
   - Description: Private SSH key for authentication
   - Generate with: `ssh-keygen -t ed25519 -C "github-actions@tasker"`
   - Copy the **private key** (id_ed25519) content here
   - Add the **public key** (id_ed25519.pub) to server's `~/.ssh/authorized_keys`

#### Staging Environment (Optional)

4. **STAGING_HOST**
   - Description: Staging server IP or hostname
   - Example: `staging.tasker.yourdomain.com`

5. **STAGING_USER**
   - Description: SSH username for staging server
   - Example: `deploy`

6. **STAGING_SSH_KEY**
   - Description: Private SSH key for staging
   - Can be the same as production or separate

## SSH Key Setup

### Generate SSH Key Pair

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions@tasker" -f ~/.ssh/tasker_deploy

# This creates:
# - ~/.ssh/tasker_deploy (private key) → Add to GitHub Secrets
# - ~/.ssh/tasker_deploy.pub (public key) → Add to server
```

### Add Public Key to Server

```bash
# Copy public key to clipboard
cat ~/.ssh/tasker_deploy.pub

# On your production server, add to authorized_keys
ssh user@your-server
mkdir -p ~/.ssh
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Add Private Key to GitHub

```bash
# Copy private key content
cat ~/.ssh/tasker_deploy

# Go to GitHub:
# Repository → Settings → Secrets and variables → Actions → New repository secret
# Name: PROD_SSH_KEY
# Value: Paste the entire private key content (including BEGIN and END lines)
```

## Testing SSH Connection

```bash
# Test from your local machine
ssh -i ~/.ssh/tasker_deploy user@your-server

# If successful, GitHub Actions will also be able to connect
```

## Server Preparation

### Install Required Software

```bash
# On production server
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin git

# Add user to docker group
sudo usermod -aG docker $USER

# Re-login or run:
newgrp docker
```

### Create Application Directory

```bash
# Create and configure directory
sudo mkdir -p /opt/tasker
sudo chown $USER:$USER /opt/tasker
cd /opt/tasker

# Clone repository (or copy docker-compose.prod.yml manually)
git clone git@github.com:georgeaf18/Tasker.git .

# Create environment file
cp .env.production.example .env.production
nano .env.production  # Configure your values
```

## Verifying Secrets

### Test Deployment Manually

1. Go to **Actions** tab in GitHub
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Choose environment (staging or production)
5. Click **Run workflow**

### Expected Flow

```
Build and Push
  ├─ Build backend image → ghcr.io/georgeaf18/tasker-backend:latest
  └─ Build frontend image → ghcr.io/georgeaf18/tasker-frontend:latest

Deploy to Server
  ├─ SSH to server
  ├─ Pull latest images
  ├─ Restart containers
  └─ Verify health
```

## Security Best Practices

### 1. Use Dedicated Deploy User

```bash
# On server, create dedicated deploy user
sudo adduser deploy
sudo usermod -aG docker deploy

# Use this user for PROD_USER secret
```

### 2. Restrict SSH Key Permissions

```bash
# On server, in ~/.ssh/authorized_keys
# Add restrictions before the key:
command="cd /opt/tasker && docker-compose -f docker-compose.prod.yml $SSH_ORIGINAL_COMMAND" ssh-ed25519 AAAA...
```

### 3. Use Environment-Specific Secrets

Create separate environments in GitHub:
- **Settings → Environments → New environment**
- Create "production" and "staging" environments
- Add environment-specific secrets
- Require reviews for production deployments

### 4. Rotate SSH Keys Regularly

```bash
# Generate new key pair
ssh-keygen -t ed25519 -C "github-actions-2024" -f ~/.ssh/tasker_deploy_new

# Add new public key to server
cat ~/.ssh/tasker_deploy_new.pub | ssh user@server "cat >> ~/.ssh/authorized_keys"

# Update GitHub secret with new private key
# Test deployment
# Remove old public key from server
```

## Troubleshooting

### "Permission denied (publickey)" Error

**Problem:** GitHub Actions can't SSH to server

**Solutions:**
1. Verify public key is in server's `~/.ssh/authorized_keys`
2. Check SSH key format (must include BEGIN and END lines)
3. Ensure `~/.ssh` permissions: `chmod 700 ~/.ssh`
4. Ensure `authorized_keys` permissions: `chmod 600 ~/.ssh/authorized_keys`
5. Check server's SSH logs: `sudo tail -f /var/log/auth.log`

### "Host key verification failed" Error

**Problem:** Server not in known_hosts

**Solution:** The workflow uses `ssh-keyscan` to automatically add the host. Ensure `PROD_HOST` is correct.

### Container Pull Failed

**Problem:** Can't pull images from GitHub Container Registry

**Solutions:**
1. Verify images were built successfully
2. Check GHCR permissions: Repository → Settings → Packages
3. Ensure packages are public or server has auth
4. Login manually on server:
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
   ```

### Deployment Succeeds but App Doesn't Work

**Problem:** Containers start but application has errors

**Solutions:**
1. Check environment variables in `.env.production`
2. View container logs: `docker-compose -f docker-compose.prod.yml logs`
3. Verify database migrations ran: `docker-compose exec backend npx prisma migrate status`
4. Check health endpoints:
   ```bash
   curl http://localhost:3000/health  # Backend
   curl http://localhost:80/health    # Frontend
   ```

## Advanced: Using GitHub Environments

### Create Protected Environment

1. **Settings → Environments → New environment**
2. Name: `production`
3. Configure protection rules:
   - ✅ Required reviewers (select team members)
   - ✅ Wait timer (e.g., 5 minutes)
   - ✅ Deployment branches (only `main`)

### Update Workflow

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    environment: production  # Add this line
    steps:
      # ... existing steps
```

### Environment-Specific Secrets

Instead of repository secrets, use environment secrets:
1. **Settings → Environments → production → Add secret**
2. Add `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY` here
3. Repeat for staging environment

Benefits:
- Different values per environment
- Protection rules
- Deployment history
- Approval workflows

## Complete Checklist

Before first deployment:

- [ ] SSH key pair generated
- [ ] Public key added to production server
- [ ] Private key added to GitHub secret `PROD_SSH_KEY`
- [ ] `PROD_HOST` secret configured
- [ ] `PROD_USER` secret configured
- [ ] Docker installed on production server
- [ ] `/opt/tasker` directory created on server
- [ ] `.env.production` configured on server
- [ ] SSH connection tested manually
- [ ] CI workflow runs successfully (optional but recommended)
- [ ] Manual workflow dispatch test completed

## Next Steps

After secrets are configured:

1. Test CI workflow with a pull request
2. Merge to main to verify automatic CI
3. Create a git tag to trigger deployment: `git tag v0.1.0 && git push --tags`
4. Monitor deployment in Actions tab
5. Verify application is running on production server

## Support

For issues:
- Check workflow logs in Actions tab
- Review server logs: `docker-compose logs`
- Consult DEPLOYMENT.md for server setup
- Open GitHub issue with workflow run URL
