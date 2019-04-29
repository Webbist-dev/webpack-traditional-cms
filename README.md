# webpack-traditional-cms

This repo aims to show how webpack can be used to enable rapid development of
front-end assets for a CMS backed project (or any project where some markup is
output by a backend application) e.g. Wordpress, Django, Umbraco, Drupal.

## Goals

1. HMR for javascript and sass in development
1. Reloading page on changes to backend views
1. Production builds with cache busting

## Running the demo

```bash
$ git clone git@github.com:rustybox/webpack-traditional-cms.git
$ cd webpack-traditional-cms
$ npm ci
$ npm run demo
```

This should start a backend server running on http://localhost:5000 and a proxy 
using webpack-dev-server on http://localhost:8080.

When viewing the site through the webpack-dev-server proxy changes to the js 
and scss in src should update the browser via HMR.

Try changing the __$primary-color__ var in __./src/scss/main.scss__ to see 
HMR in action.

The mock-cms dir contains a backend web app whose only purpose is to show
that we can wrap our backend app with webpack-dev-server.

Try changing the __home.handlebars__ file in __./mock-cms/views__ to see the 
browser reload when the backend views change.

## How this works

Most backend templating languages allow includes / master pages / layouts.
In our mock-cms this is __./mock-cms/views/layouts/main.handlebars__.

This layout references a js bundle, the bundle is not served by the backend 
application and will therefore 404 when viewing through http://localhost:5000

However when viewing through the proxy on http://localhost:8080 the file will be 
served by webpack-dev-server.

This bundle when loaded by the browser will setup HMR in development.

Sass is compiled by webpack and included in the js bundle, in development
the styles are injected into the page by webpack style-loader whereas in
production a css file and source map are built and output.

```bash
$ npm run build:prod
# css output to ./dist
```

In production builds our layout file is manipulated by [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/) to add the references to css
and js (with cache busting hashes in the URLs) and output to the __./dist__ dir.

Our reference to the js bundle from the layout is removed by 
[html-webpack-plugin-remove](https://www.npmjs.com/package/html-webpack-plugin-remove)
as it matches a regex set in when the plug-in is configured in __webpack.config.js__.

The intent is that this layout file should be copied to the backend application
during the build process (hopefully a CI build agent will handle this, you don't
want to have to commit changes to the src layout every time the hash changes).

[chokidar](https://github.com/paulmillr/chokidar) is used to watch for changes
to backend views and trigger a reload. In our mock CMS this is looking for 
changes to handlebars files in the mock-cms directory, you will want to modify
this to watch your own templates e.g .php, .cshtml, .jinja2


## tl;dr Changes required to use this for your CMS

in __webpack.config.js__

1. Change such that the devServer.proxy URL points to your backend app
2. Change html-webpack-plugin config to reference your backend layout template
3. If you don't want to serve js and css from /assets/ update public path for 
both webpack.output and webpack.devServer
4. Change chokidar watch to match your template files path and file extension

in your __layout__ file

1. reference the main javascript entrypoint bundle at the URL it will be served
by webpack-dev-server and add the data-html-webpack-remove attribute 
(or do something else so you don't reference the unhashed file which shouldn't
exist in production).

in your build / deployment process

1. copy js and css from __./dist__ to the static assets folder for your backend app
1. replace your raw layout file with the updated version in __./dist/__
