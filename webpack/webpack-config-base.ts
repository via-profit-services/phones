import { knexExternals } from '@via-profit-services/knex/dist/webpack-utils';
import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json'],
  },
  externals: [
    ...knexExternals,
    /^@via-profit-services\/core$/,
    /^@via-profit-services\/knex$/,
    /^graphql$/,
    /^moment$/,
    /^moment-timezone$/,
    /^uuid$/,
    /^winston$/,
    /^dataloader$/,
    /^winston-daily-rotate-file$/,
  ],
};

export default webpackBaseConfig;
