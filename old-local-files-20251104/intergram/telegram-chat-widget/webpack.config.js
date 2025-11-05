const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'source-map' : 'eval-source-map',

        entry: {
            widget: path.join(__dirname, 'src', 'widget', 'widget-index.js'),
            chat: path.join(__dirname, 'src', 'chat', 'chat-index.js'),
        },

        output: {
            path: path.join(__dirname, 'static', 'js'),
            filename: '[name].js',
            publicPath: '/js/',
            clean: false, // Don't clean output directory (we have other files there)
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.join(__dirname, 'src'),
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: {
                                        browsers: ['last 2 versions', 'ie >= 11']
                                    },
                                    modules: false,
                                }],
                                ['@babel/preset-react', {
                                    pragma: 'h', // Preact uses 'h' instead of 'React.createElement'
                                }]
                            ],
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ]
        },

        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            warnings: false,
                            drop_console: false, // Keep console.log for debugging
                        },
                        format: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
                new CssMinimizerPlugin(),
            ],
        },

        resolve: {
            extensions: ['.js', '.json'],
            alias: {
                'react': 'preact/compat',
                'react-dom': 'preact/compat',
            }
        },

        performance: {
            hints: isProduction ? 'warning' : false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
        },

        stats: {
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        },
    };
};
