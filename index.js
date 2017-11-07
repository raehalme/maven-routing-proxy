#!/usr/bin/env node

'use strict';

const http = require('http'),
      httpProxy = require('http-proxy'),
      config = require('config.json')('./config.json'),
      logger = require('winston');

const PORT = 8181;

function resolveRepository(path) {
    for (var url in config.repositories) {
        if (url == "default" || !config.repositories.hasOwnProperty(url)) {
            continue;
        }
        var repository = config.repositories[url];
        logger.debug("Processing repository " + url);
        var includes = repository.include;
        for (let include of includes) {
            include = include.replace(".", "/");
            if (!include.startsWith("/")) {
                include = "/" + include;
            }
            if (!include.endsWith("/")) {
                include = include + "/";
            }
            logger.debug("Testing if " + path + " starts with " + include);
            if (path.startsWith(include)) {
                logger.debug("Found a match!");
                return {
                    "url": url,
                    "username": repository.username,
                    "password": repository.password
                };
            }
        }
    };

    logger.debug("Returning default repository");
    return {
        "url": config.repositories["default"],
        "username": null,
        "password": null
    };
}

if (config.repositories == null || Object.keys(config.repositories).length == 0) {
    logger.error("Please configure repositories in config.json.");
    return;
}
else if (config.repositories["default"] == null) {
    logger.warn("No 'default' repository found in config.json");
}

for (var url in config.repositories) {
    if (url == "default") {
        continue;
    }

    var repository = config.repositories[url];
    if (repository.username != null) {
        repository.username = replaceEnv(repository.username, true);
    }
    if (repository.password != null) {
        repository.password = replaceEnv(repository.password, true);
    }
    var include = repository.include;
    if (typeof include === undefined || include == null) {
        include = "all";
    }
    logger.info("Serving " + include + " from " + url + " (username: " + repository.username + ")");
}

function replaceEnv(value, fatal) {
    return value.replace(/%([a-zA-Z0-9\-_]+)%/g, function(s, name) {
        var value = process.env[name];
        if (typeof value === 'undefined') {
            if (fatal) {
                logger.error("Environment variable " + name + " has not been defined");
                process.exit(1);
            }
            else {
                logger.warn("Environment variable " + name + " has not been defined");
                value = "";
            }
        }
        logger.debug("Replacing " + name + " with " + value);
        return value;
    });
}

var proxy = httpProxy.createProxyServer({});

http.createServer(function(req, res) {
    var repository = resolveRepository(req.url);
    if (repository.url == null) {
        logger.error("No repository matching " + req.url);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("No repository found matching " + req.url);
        res.end();
    }
    else {
        if (repository.username != null) {
            req.headers.authorization = "Basic "
                    + new Buffer(repository.username + ":" + repository.password, "ascii")
                            .toString("base64");
        }
        logger.debug("Dispatching " + req.url + " to " + repository.url + " (auth: " + (repository.username != null) + ")");
        proxy.web(req, res, {
            changeOrigin: true,
            target: repository.url
        });
    }
}).listen(PORT);

logger.info("Listening on port " + PORT);

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Proxy', 'maven-routing-proxy 0.1');
});
