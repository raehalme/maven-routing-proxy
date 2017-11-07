Maven Routing Proxy
===================

This project is a simple repository proxy for Maven which routes incoming 
requests to the correct remote repository based on groupId patterns.

The proxy is intended to be run close to the build environment improving
build performance by avoiding obsolete network requests for artifacts known to 
be located on a specific repository. It's a pity that Maven does not support 
this out of the box.
