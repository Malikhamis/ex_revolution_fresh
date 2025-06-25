/**
 * Webpack Configuration for Production Optimization
 * Bundle optimization, minification, and asset management
 */

const path = require('path');
const fs = require('fs');

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Get all JavaScript files from js directory
const jsFiles = fs.readdirSync('./js').filter(file => file.endsWith('.js'));
const entry = {};

jsFiles.forEach(file => {
    const name = file.replace('.js', '');
    entry[name] = `./js/${file}`;
});

module.exports = {
    mode: isProduction ? 'production' : 'development',
    
    entry: entry,
    
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: isProduction ? '[name].[contenthash].min.js' : '[name].js',
        clean: true,
        publicPath: '/dist/js/'
    },
    
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../images/[name].[contenthash][ext]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../fonts/[name].[contenthash][ext]'
                }
            }
        ]
    },
    
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    priority: 10
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    priority: 5,
                    reuseExistingChunk: true
                }
            }
        },
        usedExports: true,
        sideEffects: false
    },
    
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, './'),
            '@js': path.resolve(__dirname, './js'),
            '@css': path.resolve(__dirname, './css'),
            '@assets': path.resolve(__dirname, './assets')
        }
    },
    
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    performance: {
        hints: isProduction ? 'warning' : false,
        maxEntrypointSize: 250000,
        maxAssetSize: 250000
    },
    
    stats: {
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }
};
