const { SERVER_CONFIG, PATH_CONFIG } = require('./config');
const { resolve } = require('./utils');
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');
const express = require('express');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const ora = require('ora');
const chalk = require('chalk');
const ip = require('ip');
const fs = require('fs');
const shell = require('shelljs');

const spinner = ora('Compiling...');

Object.keys(webpackConfig.entry).forEach(name => {
  webpackConfig.entry[name] = [resolve('config/hotreload')].concat(
    webpackConfig.entry[name]
  );
});

const app = express();
const compiler = webpack(webpackConfig);

const devMiddleware = WebpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
});

const hotMiddleWare = WebpackHotMiddleware(compiler, { log: false });

let compiled = false;

function startNW() {
  const nwjsConfigFile = fs
    .readFileSync(resolve(`${PATH_CONFIG.MAIN}/nwjs.json`))
    .toString();

  const nwjsConfig = JSON.parse(nwjsConfigFile);
  nwjsConfig.main = `http://${ip.address()}:${SERVER_CONFIG.PORT}/${
    nwjsConfig.main
  }`;
  nwjsConfig['node-remote'] = nwjsConfig.main;

  shell.rm('-rf', resolve('.dev_client'));
  shell.exec('mkdir .dev_client', { async: false });

  fs.writeFile(
    resolve(`.dev_client/package.json`),
    JSON.stringify(nwjsConfig),
    err => {
      if (err) throw err;
      if (!shell.which('nw')) {
        shell.echo(
          "Sorry, this client requires nw, maybe you try 'sudo npm install -g nw'"
        );
        shell.exit(1);
      } else {
        shell.exec('nw .dev_client', { async: true });
      }
    }
  );
}

compiler.hooks.done.tap('start-nw-js', () => {
  if (!compiled) {
    spinner.stop();
    process.stdout.write(chalk.bold('Local dev server listen : '));
    process.stdout.write(
      chalk.underline(`http://${ip.address()}:${SERVER_CONFIG.PORT}` + '\n')
    );
    startNW();
    compiled = true;
  }
});

compiler.hooks.compilation.tap('add-hot-reload', compilation => {
  compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync(
    'add-hot-reload-to-middleware',
    (data, cb) => {
      hotMiddleWare.publish({ action: 'reload' });
      cb(null, data);
    }
  );
});

app.use(devMiddleware);
app.use(hotMiddleWare);

app.listen(SERVER_CONFIG.PORT, err => {
  err && console.error(err);
  spinner.start();
});
