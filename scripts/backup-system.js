#!/usr/bin/env node

/**
 * Automated Backup System
 * Comprehensive backup solution for database, files, and configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

class BackupManager {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.config = this.loadConfig();
        
        this.ensureBackupDirectory();
    }
    
    /**
     * Load backup configuration
     */
    loadConfig() {
        const defaultConfig = {
            retention: {
                daily: 7,    // Keep 7 daily backups
                weekly: 4,   // Keep 4 weekly backups
                monthly: 12  // Keep 12 monthly backups
            },
            compression: true,
            encryption: false,
            destinations: ['local'],
            exclude: [
                'node_modules',
                'logs',
                'temp',
                '.git',
                'coverage',
                'dist'
            ]
        };
        
        try {
            const configPath = path.join(__dirname, '../config/backup.json');
            if (fs.existsSync(configPath)) {
                const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return { ...defaultConfig, ...userConfig };
            }
        } catch (error) {
            console.warn('⚠️ Could not load backup config, using defaults');
        }
        
        return defaultConfig;
    }
    
    /**
     * Ensure backup directory exists
     */
    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log('📁 Created backup directory:', this.backupDir);
        }
    }
    
    /**
     * Create complete backup
     */
    async createBackup(type = 'manual') {
        console.log(`🔄 Starting ${type} backup...`);
        
        const backupId = `backup-${type}-${this.timestamp}`;
        const backupPath = path.join(this.backupDir, backupId);
        
        try {
            // Create backup directory
            fs.mkdirSync(backupPath, { recursive: true });
            
            // Backup components
            const results = {
                database: await this.backupDatabase(backupPath),
                files: await this.backupFiles(backupPath),
                config: await this.backupConfiguration(backupPath),
                analytics: await this.backupAnalytics(backupPath),
                logs: await this.backupLogs(backupPath)
            };
            
            // Create backup manifest
            const manifest = this.createManifest(backupId, type, results);
            fs.writeFileSync(
                path.join(backupPath, 'manifest.json'),
                JSON.stringify(manifest, null, 2)
            );
            
            // Compress backup if enabled
            if (this.config.compression) {
                await this.compressBackup(backupPath, backupId);
            }
            
            // Clean old backups
            await this.cleanOldBackups(type);
            
            console.log(`✅ Backup completed: ${backupId}`);
            return { success: true, backupId, manifest };
            
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Backup database
     */
    async backupDatabase(backupPath) {
        console.log('💾 Backing up database...');
        
        try {
            const dbBackupPath = path.join(backupPath, 'database');
            fs.mkdirSync(dbBackupPath, { recursive: true });
            
            // Backup content store
            const contentStorePath = path.join(__dirname, '../data/content-store.js');
            if (fs.existsSync(contentStorePath)) {
                fs.copyFileSync(
                    contentStorePath,
                    path.join(dbBackupPath, 'content-store.js')
                );
            }
            
            // Backup in-memory data if available
            if (global.analyticsStore) {
                fs.writeFileSync(
                    path.join(dbBackupPath, 'analytics-data.json'),
                    JSON.stringify(global.analyticsStore, null, 2)
                );
            }
            
            // Export MongoDB if connected (placeholder for actual implementation)
            if (process.env.MONGODB_URI) {
                try {
                    const mongoBackupPath = path.join(dbBackupPath, 'mongodb-dump');
                    fs.mkdirSync(mongoBackupPath, { recursive: true });
                    
                    // Note: In production, use mongodump
                    console.log('📝 MongoDB backup would be created here');
                } catch (error) {
                    console.warn('⚠️ MongoDB backup failed:', error.message);
                }
            }
            
            return { success: true, size: this.getDirectorySize(dbBackupPath) };
            
        } catch (error) {
            console.error('❌ Database backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Backup files
     */
    async backupFiles(backupPath) {
        console.log('📁 Backing up files...');
        
        try {
            const filesBackupPath = path.join(backupPath, 'files');
            fs.mkdirSync(filesBackupPath, { recursive: true });
            
            // Backup uploads directory
            const uploadsDir = path.join(__dirname, '../uploads');
            if (fs.existsSync(uploadsDir)) {
                this.copyDirectory(uploadsDir, path.join(filesBackupPath, 'uploads'));
            }
            
            // Backup assets
            const assetsDir = path.join(__dirname, '../assets');
            if (fs.existsSync(assetsDir)) {
                this.copyDirectory(assetsDir, path.join(filesBackupPath, 'assets'));
            }
            
            // Backup important files
            const importantFiles = [
                'package.json',
                'package-lock.json',
                '.env.example',
                'README.md'
            ];
            
            importantFiles.forEach(file => {
                const sourcePath = path.join(__dirname, '..', file);
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, path.join(filesBackupPath, file));
                }
            });
            
            return { success: true, size: this.getDirectorySize(filesBackupPath) };
            
        } catch (error) {
            console.error('❌ Files backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Backup configuration
     */
    async backupConfiguration(backupPath) {
        console.log('⚙️ Backing up configuration...');
        
        try {
            const configBackupPath = path.join(backupPath, 'config');
            fs.mkdirSync(configBackupPath, { recursive: true });
            
            // Backup config directory
            const configDir = path.join(__dirname, '../config');
            if (fs.existsSync(configDir)) {
                this.copyDirectory(configDir, configBackupPath);
            }
            
            // Backup middleware
            const middlewareDir = path.join(__dirname, '../middleware');
            if (fs.existsSync(middlewareDir)) {
                this.copyDirectory(middlewareDir, path.join(configBackupPath, 'middleware'));
            }
            
            // Backup scripts
            const scriptsDir = path.join(__dirname, '../scripts');
            if (fs.existsSync(scriptsDir)) {
                this.copyDirectory(scriptsDir, path.join(configBackupPath, 'scripts'));
            }
            
            return { success: true, size: this.getDirectorySize(configBackupPath) };
            
        } catch (error) {
            console.error('❌ Configuration backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Backup analytics data
     */
    async backupAnalytics(backupPath) {
        console.log('📊 Backing up analytics...');
        
        try {
            const analyticsBackupPath = path.join(backupPath, 'analytics');
            fs.mkdirSync(analyticsBackupPath, { recursive: true });
            
            // Backup analytics store
            if (global.analyticsStore && global.analyticsStore.length > 0) {
                fs.writeFileSync(
                    path.join(analyticsBackupPath, 'analytics-events.json'),
                    JSON.stringify(global.analyticsStore, null, 2)
                );
            }
            
            // Backup performance metrics
            if (global.performanceMetrics) {
                fs.writeFileSync(
                    path.join(analyticsBackupPath, 'performance-metrics.json'),
                    JSON.stringify(global.performanceMetrics, null, 2)
                );
            }
            
            return { success: true, size: this.getDirectorySize(analyticsBackupPath) };
            
        } catch (error) {
            console.error('❌ Analytics backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Backup logs
     */
    async backupLogs(backupPath) {
        console.log('📋 Backing up logs...');
        
        try {
            const logsBackupPath = path.join(backupPath, 'logs');
            fs.mkdirSync(logsBackupPath, { recursive: true });
            
            const logsDir = path.join(__dirname, '../logs');
            if (fs.existsSync(logsDir)) {
                // Only backup recent logs (last 30 days)
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                
                const logFiles = fs.readdirSync(logsDir);
                logFiles.forEach(file => {
                    const filePath = path.join(logsDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime > thirtyDaysAgo) {
                        fs.copyFileSync(filePath, path.join(logsBackupPath, file));
                    }
                });
            }
            
            return { success: true, size: this.getDirectorySize(logsBackupPath) };
            
        } catch (error) {
            console.error('❌ Logs backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Create backup manifest
     */
    createManifest(backupId, type, results) {
        return {
            id: backupId,
            type: type,
            timestamp: new Date().toISOString(),
            version: require('../package.json').version,
            environment: process.env.NODE_ENV || 'development',
            components: results,
            totalSize: Object.values(results).reduce((total, result) => {
                return total + (result.size || 0);
            }, 0),
            config: this.config
        };
    }
    
    /**
     * Compress backup
     */
    async compressBackup(backupPath, backupId) {
        console.log('🗜️ Compressing backup...');
        
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(`${backupPath}.zip`);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                console.log(`✅ Backup compressed: ${archive.pointer()} bytes`);
                
                // Remove uncompressed directory
                this.removeDirectory(backupPath);
                resolve();
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory(backupPath, false);
            archive.finalize();
        });
    }
    
    /**
     * Clean old backups based on retention policy
     */
    async cleanOldBackups(type) {
        console.log('🧹 Cleaning old backups...');
        
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(name => name.includes(`backup-${type}-`))
                .map(name => ({
                    name,
                    path: path.join(this.backupDir, name),
                    date: fs.statSync(path.join(this.backupDir, name)).mtime
                }))
                .sort((a, b) => b.date - a.date);
            
            const retention = this.config.retention[type] || this.config.retention.daily;
            const toDelete = backups.slice(retention);
            
            toDelete.forEach(backup => {
                if (fs.lstatSync(backup.path).isDirectory()) {
                    this.removeDirectory(backup.path);
                } else {
                    fs.unlinkSync(backup.path);
                }
                console.log(`🗑️ Removed old backup: ${backup.name}`);
            });
            
        } catch (error) {
            console.error('❌ Failed to clean old backups:', error);
        }
    }
    
    /**
     * Utility: Copy directory recursively
     */
    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        entries.forEach(entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
    
    /**
     * Utility: Remove directory recursively
     */
    removeDirectory(dir) {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }
    
    /**
     * Utility: Get directory size
     */
    getDirectorySize(dir) {
        if (!fs.existsSync(dir)) return 0;
        
        let size = 0;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        entries.forEach(entry => {
            const entryPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                size += this.getDirectorySize(entryPath);
            } else {
                size += fs.statSync(entryPath).size;
            }
        });
        
        return size;
    }
    
    /**
     * List available backups
     */
    listBackups() {
        const backups = fs.readdirSync(this.backupDir)
            .filter(name => name.startsWith('backup-'))
            .map(name => {
                const backupPath = path.join(this.backupDir, name);
                const stats = fs.statSync(backupPath);
                
                let manifest = null;
                try {
                    const manifestPath = stats.isDirectory() 
                        ? path.join(backupPath, 'manifest.json')
                        : null;
                    
                    if (manifestPath && fs.existsSync(manifestPath)) {
                        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    }
                } catch (error) {
                    // Ignore manifest read errors
                }
                
                return {
                    name,
                    path: backupPath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    isCompressed: name.endsWith('.zip'),
                    manifest
                };
            })
            .sort((a, b) => b.created - a.created);
        
        return backups;
    }
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2] || 'create';
    const type = process.argv[3] || 'manual';
    
    const backupManager = new BackupManager();
    
    switch (command) {
        case 'create':
            backupManager.createBackup(type)
                .then(result => {
                    if (result.success) {
                        console.log(`\n✅ Backup completed successfully!`);
                        console.log(`📁 Backup ID: ${result.backupId}`);
                        console.log(`📊 Total size: ${(result.manifest.totalSize / 1024 / 1024).toFixed(2)} MB`);
                    } else {
                        console.error(`\n❌ Backup failed: ${result.error}`);
                        process.exit(1);
                    }
                });
            break;
            
        case 'list':
            const backups = backupManager.listBackups();
            console.log(`\n📋 Available backups (${backups.length}):`);
            backups.forEach(backup => {
                console.log(`  ${backup.name} - ${backup.created.toISOString()} (${(backup.size / 1024 / 1024).toFixed(2)} MB)`);
            });
            break;
            
        default:
            console.log(`
Usage: node backup-system.js [command] [type]

Commands:
  create [type]  Create a new backup (default: manual)
  list          List available backups

Types:
  manual        Manual backup
  daily         Daily automated backup
  weekly        Weekly automated backup
  monthly       Monthly automated backup
            `);
    }
}

module.exports = BackupManager;
