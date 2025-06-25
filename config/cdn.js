/**
 * CDN Configuration and Asset Management
 * Handles CDN URLs, asset optimization, and fallback strategies
 */

const path = require('path');
const fs = require('fs');

/**
 * CDN Configuration
 */
const CDN_CONFIG = {
    // Primary CDN providers
    providers: {
        cloudflare: {
            name: 'Cloudflare',
            baseUrl: 'https://cdn.exrevolution.com',
            regions: ['global'],
            features: ['compression', 'caching', 'ssl', 'ddos-protection']
        },
        jsdelivr: {
            name: 'jsDelivr',
            baseUrl: 'https://cdn.jsdelivr.net/gh/exrevolution/assets',
            regions: ['global'],
            features: ['compression', 'caching', 'ssl']
        },
        unpkg: {
            name: 'UNPKG',
            baseUrl: 'https://unpkg.com/@exrevolution/assets',
            regions: ['global'],
            features: ['compression', 'caching', 'ssl']
        }
    },
    
    // Asset types and their CDN preferences
    assetTypes: {
        css: {
            provider: 'cloudflare',
            fallback: 'jsdelivr',
            compression: true,
            versioning: true,
            cacheTime: '30d'
        },
        js: {
            provider: 'cloudflare',
            fallback: 'jsdelivr',
            compression: true,
            versioning: true,
            cacheTime: '30d'
        },
        images: {
            provider: 'cloudflare',
            fallback: 'jsdelivr',
            compression: true,
            versioning: false,
            cacheTime: '365d',
            formats: ['webp', 'avif', 'jpg', 'png']
        },
        fonts: {
            provider: 'cloudflare',
            fallback: 'jsdelivr',
            compression: true,
            versioning: false,
            cacheTime: '365d'
        }
    },
    
    // Environment-specific settings
    environments: {
        development: {
            enabled: false,
            useLocal: true
        },
        staging: {
            enabled: true,
            provider: 'jsdelivr'
        },
        production: {
            enabled: true,
            provider: 'cloudflare'
        }
    }
};

/**
 * Asset URL Generator
 */
class CDNManager {
    constructor(environment = 'development') {
        this.environment = environment;
        this.config = CDN_CONFIG;
        this.assetManifest = this.loadAssetManifest();
    }
    
    /**
     * Load asset manifest for versioning
     */
    loadAssetManifest() {
        try {
            const manifestPath = path.join(__dirname, '../dist/asset-manifest.json');
            if (fs.existsSync(manifestPath)) {
                return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️ Could not load asset manifest:', error.message);
        }
        return {};
    }
    
    /**
     * Get CDN URL for an asset
     */
    getAssetUrl(assetPath, assetType = 'auto') {
        const envConfig = this.config.environments[this.environment];
        
        // Use local assets in development or if CDN is disabled
        if (!envConfig.enabled || envConfig.useLocal) {
            return this.getLocalAssetUrl(assetPath);
        }
        
        // Auto-detect asset type from file extension
        if (assetType === 'auto') {
            assetType = this.detectAssetType(assetPath);
        }
        
        const typeConfig = this.config.assetTypes[assetType];
        if (!typeConfig) {
            console.warn(`⚠️ Unknown asset type: ${assetType}`);
            return this.getLocalAssetUrl(assetPath);
        }
        
        // Get provider configuration
        const providerName = envConfig.provider || typeConfig.provider;
        const provider = this.config.providers[providerName];
        
        if (!provider) {
            console.warn(`⚠️ Unknown CDN provider: ${providerName}`);
            return this.getLocalAssetUrl(assetPath);
        }
        
        // Build CDN URL
        let cdnUrl = `${provider.baseUrl}/${assetPath}`;
        
        // Add version hash if available and enabled
        if (typeConfig.versioning && this.assetManifest[assetPath]) {
            const versionedPath = this.assetManifest[assetPath];
            cdnUrl = `${provider.baseUrl}/${versionedPath}`;
        }
        
        return cdnUrl;
    }
    
    /**
     * Get local asset URL
     */
    getLocalAssetUrl(assetPath) {
        // Remove leading slash if present
        const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
        
        // Check if versioned asset exists in manifest
        if (this.assetManifest[cleanPath]) {
            return `/${this.assetManifest[cleanPath]}`;
        }
        
        return `/${cleanPath}`;
    }
    
    /**
     * Detect asset type from file extension
     */
    detectAssetType(assetPath) {
        const ext = path.extname(assetPath).toLowerCase();
        
        const typeMap = {
            '.css': 'css',
            '.js': 'js',
            '.jpg': 'images',
            '.jpeg': 'images',
            '.png': 'images',
            '.gif': 'images',
            '.webp': 'images',
            '.avif': 'images',
            '.svg': 'images',
            '.woff': 'fonts',
            '.woff2': 'fonts',
            '.ttf': 'fonts',
            '.eot': 'fonts',
            '.otf': 'fonts'
        };
        
        return typeMap[ext] || 'unknown';
    }
    
    /**
     * Generate fallback HTML for critical assets
     */
    generateFallbackHtml(assetPath, assetType) {
        const cdnUrl = this.getAssetUrl(assetPath, assetType);
        const localUrl = this.getLocalAssetUrl(assetPath);
        
        if (assetType === 'css') {
            return `
<link rel="stylesheet" href="${cdnUrl}" onerror="this.onerror=null;this.href='${localUrl}';">
<noscript><link rel="stylesheet" href="${localUrl}"></noscript>`;
        }
        
        if (assetType === 'js') {
            return `
<script src="${cdnUrl}" onerror="document.write('<script src=\\"${localUrl}\\"><\\/script>')"></script>`;
        }
        
        return `<!-- Fallback not implemented for ${assetType} -->`;
    }
    
    /**
     * Get performance hints for assets
     */
    getPerformanceHints(assetPath, assetType) {
        const typeConfig = this.config.assetTypes[assetType];
        if (!typeConfig) return {};
        
        return {
            preload: assetType === 'css' || assetType === 'js',
            prefetch: assetType === 'images',
            cacheTime: typeConfig.cacheTime,
            compression: typeConfig.compression
        };
    }
    
    /**
     * Generate resource hints HTML
     */
    generateResourceHints(assets) {
        const hints = [];
        
        assets.forEach(({ path: assetPath, type }) => {
            const cdnUrl = this.getAssetUrl(assetPath, type);
            const perfHints = this.getPerformanceHints(assetPath, type);
            
            if (perfHints.preload) {
                const as = type === 'css' ? 'style' : 'script';
                hints.push(`<link rel="preload" href="${cdnUrl}" as="${as}">`);
            }
            
            if (perfHints.prefetch) {
                hints.push(`<link rel="prefetch" href="${cdnUrl}">`);
            }
        });
        
        return hints.join('\n');
    }
    
    /**
     * Get CDN statistics
     */
    getStats() {
        return {
            environment: this.environment,
            cdnEnabled: this.config.environments[this.environment].enabled,
            provider: this.config.environments[this.environment].provider,
            assetManifestLoaded: Object.keys(this.assetManifest).length > 0,
            supportedAssetTypes: Object.keys(this.config.assetTypes),
            availableProviders: Object.keys(this.config.providers)
        };
    }
}

/**
 * Helper functions for template usage
 */
const createCDNHelpers = (environment) => {
    const cdnManager = new CDNManager(environment);
    
    return {
        asset: (path, type) => cdnManager.getAssetUrl(path, type),
        css: (path) => cdnManager.getAssetUrl(path, 'css'),
        js: (path) => cdnManager.getAssetUrl(path, 'js'),
        image: (path) => cdnManager.getAssetUrl(path, 'images'),
        font: (path) => cdnManager.getAssetUrl(path, 'fonts'),
        fallback: (path, type) => cdnManager.generateFallbackHtml(path, type),
        hints: (assets) => cdnManager.generateResourceHints(assets),
        stats: () => cdnManager.getStats()
    };
};

module.exports = {
    CDN_CONFIG,
    CDNManager,
    createCDNHelpers
};
