const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
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
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
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
