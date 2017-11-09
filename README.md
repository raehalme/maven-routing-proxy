Maven Routing Proxy
===================

This project implements a very simple repository proxy for Maven routing 
incoming requests to the correct remote repository based on groupId prefix.

The proxy is intended to be run close to the build environment typically as
part of the build process on the CI server. It aims to improve build performance
and security by avoiding obsolete network requests for artifacts known to be 
located on a specific repository. It's a pity that Maven does not support this 
out of the box.


Quick Setup
-----------

1. Install the proxy with npm: `sudo npm i maven-routing-proxy -g`

2. Configure repositories in `config.json`.

3. Start the proxy with `mvnproxy` in the same directory as `config.json`.

4. Configure Maven to use mirror at `http://localhost:8181`.

5. Profit!!


Installation
------------

Use NPM to install the proxy:

```
$ sudo npm i maven-routing-proxy -g
```

After installation the command `mvnproxy` should be within `PATH`.


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
request is directed at in case none of the previous repositories match the
dependency groupId. The default repository is optional and does not accept 
credentials.


Running the Proxy
-----------------

After the proxy has been configured the proxy can be started:

```
$ mvnproxy
```

Make sure that the configuration file `config.json` is located in the same
directory where the proxy is started.

The proxy accepts connections on port 8181. At the moment the port is fixed
and cannot be changed through configuration.


Configuring Maven
-----------------

To start using the proxy you need to configure a mirror in Maven. Mirrors are
configured in `~/.m2/settings.xml`. Below is a complete example of the 
configuration file:

```
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/POM/4.0.0" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                            http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <mirrors>
    <mirror>
      <url>http://localhost:8181</url>
      <mirrorOf>*</mirrorOf>
    </mirror>
  </mirrors>
</settings>
```

Full instructions on how to configure mirrors can be found in 
[the Maven documentation](https://maven.apache.org/guides/mini/guide-mirror-settings.html).


Running the Proxy with Docker
-----------------------------

Docker Hub contains 
[a ready-to-run image](https://hub.docker.com/r/raehalme/maven-routing-proxy/) 
which can be configured using environment variables.

Define your repositories with environment variables `REPO1_URL`, `REPO2_URL` 
and so on. Use a comma separated list with `REPO1_INCLUDES` and `REPO2_INCLUDES`
to configure the groupIds associated with the repository. Username and password
can be configured with `REPO1_USERNAME` and `REPO1_PASSWORD`. The default 
repository is Maven Central (ie. https://repo.maven.apache.org/maven2).

If you want to reference additional environment variables within the repository
configuration (eg. username and password) you can do that by surrounding the
environment variable with percent characters, eg. `%NEXUS_USERNAME%`. The value
is replaced with the value of the corresponding environment variable, eg. 
`NEXUS_USERNAME`.

The maximum number of repositories that can be configured with the Docker image
is 10. Just modify `run.sh` if you need more.


Contributions
-------------

If you need an enhancement or encounter a bug please create an issue. I'll have
a look and try to come up with a solution. 

Contributions are also welcome! Please feel free to submit PRs with issues.
