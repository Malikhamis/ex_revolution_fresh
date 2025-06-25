/**
 * PostCSS Configuration
 * CSS optimization and processing
 */

module.exports = {
    plugins: [
        require('autoprefixer')({
            overrideBrowserslist: [
                '> 1%',
                'last 2 versions',
                'not dead',
                'not ie 11'
            ]
        }),
        require('cssnano')({
            preset: ['default', {
                discardComments: {
                    removeAll: true
                },
                normalizeWhitespace: true,
                minifySelectors: true,
                minifyParams: true,
                minifyFontValues: true,
                colormin: true,
                convertValues: true,
                discardDuplicates: true,
                discardEmpty: true,
                discardOverridden: true,
                discardUnused: false, // Keep false to avoid removing used classes
                mergeIdents: false,
                mergeRules: true,
                mergeLonghand: true,
                normalizeCharset: true,
                normalizeDisplayValues: true,
                normalizePositions: true,
                normalizeRepeatStyle: true,
                normalizeString: true,
                normalizeTimingFunctions: true,
                normalizeUnicode: true,
                normalizeUrl: true,
                orderedValues: true,
                reduceIdents: false,
                reduceInitial: true,
                reduceTransforms: true,
                svgo: true,
                uniqueSelectors: true
            }]
        })
    ]
};
