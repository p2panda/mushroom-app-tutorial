const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => {
  if (!fs.existsSync('./schemas.json')) {
    throw new Error(
      'You have to create a `schemas.json` file first.\n\nPlease start a p2panda node and run `npm run schema`.',
    );
  }

  return {
    entry: './src/index.tsx',
    output: {
      filename: './dist/index.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    devServer: {
      historyApiFallback: true,
      hot: false,
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Mushrooms!',
      }),
    ],
  };
};
