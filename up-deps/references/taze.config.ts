import { defineConfig } from 'taze'

export default defineConfig({
  // Ignore packages from bumping
  exclude: [
    'webpack'
  ],
  // Fetch latest package info from registry without cache
  force: true,
  // Write to package.json
  write: true,
  // Run npm install or yarn install right after bumping
  install: true,
  // Ignore paths for looking for package.json in monorepo
  ignorePaths: [
    '**/node_modules/**',
    '**/test/**',
  ],
  // Ignore package.json that in other workspaces
  ignoreOtherWorkspaces: true,
  // Override with different bumping mode for each package
  packageMode: {
    'typescript': 'major',
    'unocss': 'ignore',
    // regex starts and ends with '/'
    '/vue/': 'latest'
  },
  // Disable checking for "overrides" package.json field
  depFields: {
    overrides: false
  }
})
