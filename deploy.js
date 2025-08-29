#!/usr/bin/env node

/**
 * PWA Template Deployment Script
 * 
 * This script automatically updates version numbers and timestamps
 * when deploying the PWA template to ensure proper cache management.
 * 
 * Usage:
 *   node deploy.js [version]
 * 
 * Examples:
 *   node deploy.js              # Auto-increment patch version
 *   node deploy.js 4.1.0        # Set specific version
 *   node deploy.js --patch      # Increment patch version
 *   node deploy.js --minor      # Increment minor version
 *   node deploy.js --major      # Increment major version
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    versionFile: './version.json',
    serviceWorkerFile: './service-worker.js',
    manifestFile: './manifest.json',
    defaultVersion: '4.0.0'
};

// Parse command line arguments
const args = process.argv.slice(2);
let newVersion = null;
let incrementType = null;

if (args.length === 0) {
    incrementType = 'patch';
} else if (args[0] === '--patch') {
    incrementType = 'patch';
} else if (args[0] === '--minor') {
    incrementType = 'minor';
} else if (args[0] === '--major') {
    incrementType = 'major';
} else {
    newVersion = args[0];
}

// Version management functions
function parseVersion(version) {
    const parts = version.split('.').map(Number);
    return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0
    };
}

function formatVersion(versionObj) {
    return `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
}

function incrementVersion(currentVersion, type) {
    const version = parseVersion(currentVersion);
    
    switch (type) {
        case 'major':
            version.major++;
            version.minor = 0;
            version.patch = 0;
            break;
        case 'minor':
            version.minor++;
            version.patch = 0;
            break;
        case 'patch':
            version.patch++;
            break;
    }
    
    return formatVersion(version);
}

function getCurrentVersion() {
    try {
        if (fs.existsSync(CONFIG.versionFile)) {
            const versionData = JSON.parse(fs.readFileSync(CONFIG.versionFile, 'utf8'));
            return versionData.version;
        }
    } catch (error) {
        console.warn('Could not read current version:', error.message);
    }
    return CONFIG.defaultVersion;
}

// Update version.json
function updateVersionFile(version) {
    const now = new Date();
    const buildTime = Date.now();
    
    const versionData = {
        version: version,
        buildTime: buildTime,
        lastUpdated: now.toISOString(),
        changelog: [
            `Version ${version} - Auto-generated deployment`,
            "Enhanced auto-updater and cache manager",
            "Improved browser caching strategy",
            "Added version control and update notifications",
            "Better offline support and cache management"
        ],
        features: {
            autoUpdate: true,
            cacheManagement: true,
            offlineSupport: true,
            updateNotifications: true
        },
        cacheConfig: {
            maxAge: 604800000,
            maxEntries: 100,
            checkInterval: 1800000
        }
    };
    
    fs.writeFileSync(CONFIG.versionFile, JSON.stringify(versionData, null, 2));
    console.log(`✅ Updated ${CONFIG.versionFile} to version ${version}`);
}

// Update service worker version
function updateServiceWorkerVersion(version) {
    try {
        let content = fs.readFileSync(CONFIG.serviceWorkerFile, 'utf8');
        
        // Update version in cache config
        content = content.replace(
            /version: ['"]\d+\.\d+\.\d+['"]/,
            `version: '${version}'`
        );
        
        // Update cache name
        content = content.replace(
            /name: ['"]pwa-template-v\d+['"]/,
            `name: 'pwa-template-v${version.split('.')[0]}'`
        );
        
        // Update build time
        content = content.replace(
            /buildTime: \d+/,
            `buildTime: ${Date.now()}`
        );
        
        fs.writeFileSync(CONFIG.serviceWorkerFile, content);
        console.log(`✅ Updated ${CONFIG.serviceWorkerFile} to version ${version}`);
    } catch (error) {
        console.error(`❌ Error updating service worker:`, error.message);
    }
}

// Update manifest version (if needed)
function updateManifestVersion(version) {
    try {
        const manifestPath = CONFIG.manifestFile;
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Add version to manifest if it doesn't exist
            if (!manifest.version) {
                manifest.version = version;
                fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                console.log(`✅ Added version ${version} to ${manifestPath}`);
            }
        }
    } catch (error) {
        console.error(`❌ Error updating manifest:`, error.message);
    }
}

// Create deployment info
function createDeploymentInfo(version) {
    const deploymentInfo = {
        version: version,
        deployedAt: new Date().toISOString(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        gitCommit: process.env.GITHUB_SHA || 'unknown',
        buildNumber: process.env.GITHUB_RUN_NUMBER || 'local'
    };
    
    fs.writeFileSync('./deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`✅ Created deployment-info.json`);
}

// Main deployment function
function deploy() {
    console.log('🚀 Starting PWA Template Deployment...\n');
    
    // Determine new version
    const currentVersion = getCurrentVersion();
    
    if (newVersion) {
        // Use specified version
        console.log(`📦 Setting version to ${newVersion}`);
    } else if (incrementType) {
        // Increment version
        newVersion = incrementVersion(currentVersion, incrementType);
        console.log(`📦 Incrementing ${incrementType} version: ${currentVersion} → ${newVersion}`);
    } else {
        newVersion = currentVersion;
        console.log(`📦 Using current version: ${newVersion}`);
    }
    
    // Update files
    try {
        updateVersionFile(newVersion);
        updateServiceWorkerVersion(newVersion);
        updateManifestVersion(newVersion);
        createDeploymentInfo(newVersion);
        
        console.log('\n✅ Deployment completed successfully!');
        console.log(`📋 Version: ${newVersion}`);
        console.log(`🕒 Build Time: ${new Date().toLocaleString()}`);
        console.log('\n📝 Next steps:');
        console.log('   1. Commit your changes');
        console.log('   2. Push to your repository');
        console.log('   3. Deploy to your hosting platform');
        console.log('   4. The PWA will automatically update for users');
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run deployment
if (require.main === module) {
    deploy();
}

module.exports = {
    deploy,
    updateVersionFile,
    updateServiceWorkerVersion,
    incrementVersion
};
