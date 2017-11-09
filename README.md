Maven Routing Proxy
===================

This project is a simple repository proxy for Maven which routes incoming 
requests to the correct remote repository based on groupId patterns.

The proxy is intended to be run close to the build environment improving
build performance by avoiding obsolete network requests for artifacts known to 
be located on a specific repository. It's a pity that Maven does not support 
this out of the box.


Quick Setup
-----------

1. Install the proxy with npm: `sudo npm i maven-routing-proxy -g`

2. Configure repositories in `config.json`.

3. Start the proxy with `mvnproxy`.

4. Configure Maven to use mirror at `http://localhost:8181`.

5. Profit!!


Configuration
-------------

The proxy reads `config.json` from the work directory (where the proxy is 
started). The configuration file contains the list of repositories where to 
look for dependencies with their corresponding groupIds, and also defines 
the default repository to use.

The following example adds three repositories there the first two are used only
when the groupId of the dependency starts with the list of values specified by
`include`. The final, default, is used when none of the previous definitions 
match the dependency groupId.

```
{
  "repositories": {
    "https://example.com/nexus/content/repositories/releases": {
      "username": "%NEXUS_USERNAME%",
      "password": "%NEXUS_PASSWORD%",      
      "include": [ "com.example", "org.example" ]	    
    },
    "https://repo.example.net/maven2": {
      "include": [ "net.example" ]
    },
    "default": "https://repo.maven.apache.org/maven2"
  }
}
```

The first example uses environment variables NEXUS_USERNAME and NEXUS_PASSWORD
to configure credentials. At the moment only Basic authentication is supported
for authentication but that is sufficient with at least 
[Nexus](http://www.sonatype.org/nexus/). 

The credentials are optional and the second example does not specify any.

Finally `"default"` is used to configure the default repository to which the
request is directed in case none of the previous repositories match the
dependency groupId.


Running the Proxy
-----------------


Configuring Maven
-----------------
