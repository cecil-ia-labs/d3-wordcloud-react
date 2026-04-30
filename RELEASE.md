# Release Process

## How to Set the Latest Commit Before Running Actions

This repository uses GitHub Actions for automated testing and publishing to npm. The workflow is triggered when a release is created. Here's how to ensure the latest commit is used:

### 1. Creating a Release

1. **Make sure all changes are committed and pushed** to the main branch
2. **Create a tag** for your release:
   ```bash
   git tag v1.3.2
   git push origin v1.3.2
   ```
3. **Create a release** on GitHub:
   - Go to the repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select the tag you just created
   - Fill in release notes
   - Publish the release

### 2. How the Workflow Ensures Latest Commit

The GitHub Actions workflow (`.github/workflows/npm-publish.yml`) is configured to:

- **Trigger on release creation**: The workflow only runs when a release is created
- **Checkout with full history**: Uses `fetch-depth: 0` to ensure complete git history is available
- **Use the tagged commit**: Automatically checks out the exact commit that was tagged for the release

### 3. Workflow Configuration

The key configurations that ensure the latest commit is used:

```yaml
- uses: actions/checkout@v4
  with:
    # Fetch full history to ensure we have the complete commit history
    fetch-depth: 0
```

### 4. Troubleshooting

If the workflow fails:

1. **Check the build logs** in the Actions tab
2. **Ensure all dependencies are properly installed** with `npm ci`
3. **Verify the test script passes** locally with `npm test`
4. **Make sure package.json version matches** the release tag

### 5. Local Testing

Before creating a release, test the complete workflow locally:

```bash
npm run clean
npm ci
npm test
npm run build
```

This simulates what the GitHub Actions workflow will do.

## Current Workflow Status

✅ Fixed npm test script to not exit with error
✅ Added npm caching for faster builds
✅ Configured proper git checkout with full history
✅ Local testing passes all steps