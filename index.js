#!/usr/bin/env node

'use strict';

const http = require('http'),
      httpProxy = require('http-proxy'),
      config = require('config.json')('./config.json'),
      logger = require('winston');

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
                var username = null, password = null;
                if (repository.username != null) {
                    logger.debug("Resolving authentication from environment variables "
                            + repository.username + " and " + repository.password);
                    username = process.env[repository.username];
                    password = process.env[repository.password];
                }
                return {
                    "url": url,
                    "username": username,
                    "password": password
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


var proxy = httpProxy.createProxyServer({});

http.createServer(function(req, res) {
    var repository = resolveRepository(req.url);
    if (repository.username != null) {
        req.headers.authorization = "Basic "
                + new Buffer(repository.username + ":" + repository.password, "ascii")
                        .toString("base64");
    }
    logger.info("Dispatching " + req.url + " to " + repository.url + " (auth: " + (repository.username != null) + ")");
    proxy.web(req, res, {
        changeOrigin: true,
        target: repository.url
    });
}).listen(8181);

//proxy.on('proxyReq', function(proxyReq, req, res, options) {
//  proxyReq.setHeader('X-Proxy', 'maven-routing-proxy 0.1');
//});
