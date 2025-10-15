# Git Branching Strategy

## Branch Structure

```
main (production)
├── develop (integration)
│   ├── feature/user-service
│   ├── feature/product-service
│   ├── feature/order-service
│   ├── feature/api-gateway
│   └── feature/frontend
└── testing (staging)
```

## Branch Descriptions

### Core Branches

#### `main` Branch
- **Purpose**: Production-ready, stable code
- **Who**: DevOps/Lead developers only
- **Protection**: Requires pull request approval
- **Deployment**: Auto-deploys to production

#### `develop` Branch
- **Purpose**: Integration branch for all services
- **Who**: All developers merge here
- **Protection**: Requires pull request from feature branches
- **Deployment**: Auto-deploys to staging environment

#### `testing` Branch
- **Purpose**: Integration testing and staging
- **Who**: QA team and integration testing
- **Protection**: Requires pull request from develop
- **Deployment**: Manual deployment to testing environment

### Service Feature Branches

#### `feature/user-service`
- **Purpose**: User service development
- **Developer**: User Service Developer
- **Merge to**: `develop`
- **Scope**: Authentication, user management, Firebase integration

#### `feature/product-service`
- **Purpose**: Product service development
- **Developer**: Product Service Developer
- **Merge to**: `develop`
- **Scope**: Product CRUD, Elasticsearch, search functionality

#### `feature/order-service`
- **Purpose**: Order service development
- **Developer**: Order Service Developer
- **Merge to**: `develop`
- **Scope**: Order management, Stripe integration, payments

#### `feature/api-gateway`
- **Purpose**: API Gateway development
- **Developer**: Gateway Developer
- **Merge to**: `develop`
- **Scope**: Request routing, authentication, rate limiting

#### `feature/frontend`
- **Purpose**: Frontend development
- **Developer**: Frontend Developer
- **Merge to**: `develop`
- **Scope**: React UI, user interface, Firebase auth

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd E-Commerce

# Create and switch to develop branch
git checkout -b develop
git push -u origin develop

# Create service branches from develop
git checkout -b feature/user-service
git checkout -b feature/product-service
git checkout -b feature/order-service
git checkout -b feature/api-gateway
git checkout -b feature/frontend
git checkout -b testing
```

### 2. Daily Development Workflow

#### For Service Developers:
```bash
# Switch to your service branch
git checkout feature/user-service  # or your service

# Pull latest changes from develop
git pull origin develop

# Make your changes
git add .
git commit -m "feat: implement user authentication"

# Push to your feature branch
git push origin feature/user-service

# Create pull request to develop
```

#### For Integration:
```bash
# Switch to develop
git checkout develop

# Pull latest changes
git pull origin develop

# Merge feature branch (via PR)
git merge feature/user-service

# Push to develop
git push origin develop
```

### 3. Testing Workflow
```bash
# Switch to testing branch
git checkout testing

# Pull from develop
git pull origin develop

# Run integration tests
docker-compose up --build
npm test  # or your test commands

# If tests pass, merge to main
git checkout main
git merge testing
git push origin main
```

## Branch Protection Rules

### `main` Branch Protection
- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main branch

### `develop` Branch Protection
- Require pull request reviews (1 reviewer)
- Require status checks to pass
- Allow force pushes (for rebasing)

### `testing` Branch Protection
- Require pull request reviews (1 reviewer)
- Require status checks to pass
- Allow force pushes (for testing iterations)

## Commit Message Convention

Use conventional commits for better tracking:

```
feat: add user authentication endpoint
fix: resolve database connection issue
docs: update API documentation
test: add unit tests for user service
refactor: improve error handling
```

## Pull Request Template

### For Feature Branches → Develop
```markdown
## Service: [Service Name]

### Changes
- [ ] Feature implemented
- [ ] Tests added
- [ ] Documentation updated

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes documented
```

### For Develop → Testing
```markdown
## Integration Testing

### Services Updated
- [ ] User Service
- [ ] Product Service
- [ ] Order Service
- [ ] API Gateway
- [ ] Frontend

### Testing Checklist
- [ ] All services start successfully
- [ ] Database connections work
- [ ] API endpoints respond
- [ ] Frontend loads correctly
- [ ] Integration tests pass
```

## Deployment Strategy

### Development Environment
- **Branch**: `develop`
- **Trigger**: Push to develop
- **URL**: `https://dev.ecommerce.com`

### Testing Environment
- **Branch**: `testing`
- **Trigger**: Push to testing
- **URL**: `https://test.ecommerce.com`

### Production Environment
- **Branch**: `main`
- **Trigger**: Push to main
- **URL**: `https://ecommerce.com`

## Emergency Hotfixes

For critical production issues:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-fix

# Make emergency fix
git add .
git commit -m "hotfix: resolve critical payment issue"

# Merge to main and develop
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout develop
git merge hotfix/critical-fix
git push origin develop
```

## Best Practices

1. **Always pull latest changes** before starting work
2. **Keep feature branches small** and focused
3. **Write descriptive commit messages**
4. **Test thoroughly** before merging
5. **Use pull requests** for code review
6. **Delete feature branches** after merging
7. **Keep develop branch stable** for integration
8. **Regular communication** between service developers

## Troubleshooting

### Merge Conflicts
```bash
# Pull latest changes
git pull origin develop

# Resolve conflicts manually
# Add resolved files
git add .

# Complete merge
git commit -m "resolve merge conflicts"
```

### Branch Cleanup
```bash
# Delete local feature branch
git branch -d feature/user-service

# Delete remote feature branch
git push origin --delete feature/user-service

# Clean up merged branches
git branch --merged | grep -v main | xargs -n 1 git branch -d
```

This branching strategy ensures smooth collaboration while maintaining code quality and deployment safety.
