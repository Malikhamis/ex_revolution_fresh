#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests with detailed reporting and coverage analysis
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting comprehensive test suite...\n');

// Test configuration
const testSuites = [
    {
        name: 'Unit Tests',
        command: 'npm run test:unit',
        description: 'Testing individual components and functions',
        critical: true
    },
    {
        name: 'Integration Tests',
        command: 'npm run test:integration',
        description: 'Testing API endpoints and system integration',
        critical: true
    },
    {
        name: 'Code Coverage',
        command: 'npm run test:coverage',
        description: 'Generating code coverage report',
        critical: false
    },
    {
        name: 'Code Linting',
        command: 'npm run lint',
        description: 'Checking code quality and style',
        critical: false
    }
];

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: testSuites.length,
    details: [],
    startTime: Date.now()
};

// Run test suites
for (const suite of testSuites) {
    console.log(`📋 Running ${suite.name}...`);
    console.log(`   ${suite.description}`);
    
    const startTime = Date.now();
    
    try {
        const output = execSync(suite.command, { 
            stdio: 'pipe',
            cwd: path.join(__dirname, '..'),
            encoding: 'utf8'
        });
        
        const duration = Date.now() - startTime;
        
        console.log(`   ✅ Passed in ${duration}ms`);
        
        results.passed++;
        results.details.push({
            name: suite.name,
            status: 'passed',
            duration: duration,
            critical: suite.critical,
            output: output.substring(0, 500) // Truncate long output
        });
        
    } catch (error) {
        const duration = Date.now() - startTime;
        
        console.log(`   ❌ Failed in ${duration}ms`);
        
        if (suite.critical) {
            console.error(`   Critical test failed: ${error.message}`);
        }
        
        results.failed++;
        results.details.push({
            name: suite.name,
            status: 'failed',
            duration: duration,
            critical: suite.critical,
            error: error.message,
            output: error.stdout?.toString() || error.stderr?.toString() || ''
        });
        
        // Stop on critical test failure
        if (suite.critical) {
            console.log('\n🚨 Critical test failed! Stopping test execution.\n');
            break;
        }
    }
    
    console.log('');
}

// Calculate total duration
const totalDuration = Date.now() - results.startTime;

// Generate test report
console.log('📊 Test Results Summary:');
console.log(`   Total Duration: ${totalDuration}ms`);
console.log(`   Passed: ${results.passed}/${results.total}`);
console.log(`   Failed: ${results.failed}/${results.total}`);
console.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

// Detailed results
console.log('\n📋 Detailed Results:');
results.details.forEach((result, index) => {
    const status = result.status === 'passed' ? '✅' : '❌';
    const critical = result.critical ? ' (Critical)' : '';
    console.log(`   ${index + 1}. ${status} ${result.name}${critical} - ${result.duration}ms`);
    
    if (result.status === 'failed' && result.error) {
        console.log(`      Error: ${result.error.substring(0, 100)}...`);
    }
});

// Generate JSON report
const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    totalDuration: totalDuration,
    summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        successRate: ((results.passed / results.total) * 100).toFixed(1) + '%'
    },
    suites: results.details
};

// Save report
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

const reportFile = path.join(reportsDir, `test-report-${Date.now()}.json`);
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

console.log(`\n📄 Test report saved: ${reportFile}`);

// Check coverage if available
const coverageDir = path.join(__dirname, '../coverage');
if (fs.existsSync(coverageDir)) {
    console.log('\n📊 Code Coverage:');
    
    try {
        const coverageFile = path.join(coverageDir, 'coverage-summary.json');
        if (fs.existsSync(coverageFile)) {
            const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
            
            console.log(`   Lines: ${coverage.total.lines.pct}%`);
            console.log(`   Functions: ${coverage.total.functions.pct}%`);
            console.log(`   Branches: ${coverage.total.branches.pct}%`);
            console.log(`   Statements: ${coverage.total.statements.pct}%`);
            console.log(`   Report: coverage/lcov-report/index.html`);
        }
    } catch (error) {
        console.log('   Coverage report not available');
    }
}

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
if (totalDuration > 30000) {
    console.log('   • Consider parallelizing tests to reduce execution time');
}
if (results.failed > 0) {
    console.log('   • Fix failing tests before deployment');
}
console.log('   • Run tests in watch mode during development: npm run test:watch');
console.log('   • Generate coverage reports regularly: npm run test:coverage');

// Exit with appropriate code
const exitCode = results.failed > 0 ? 1 : 0;

if (exitCode === 0) {
    console.log('\n🎉 All tests passed! Ready for deployment.\n');
} else {
    console.log('\n🚨 Some tests failed. Please fix before proceeding.\n');
}

process.exit(exitCode);
