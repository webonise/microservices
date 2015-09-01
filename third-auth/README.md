Third Party Auth Microservice
================================

This microservice is responsible for performing various bits of third-party authentication. The basic idea is that you direct the user to a
URL for this microservice, and it manages the authentication with the third-party system. If the authentication is successful, the microservice
stores the authentication and profile information into Redis, along with an authentication token. That authentication token is set as a transient
cookie. The user is then redirected back into the calling application, which can use the authentication token from the cookie to get the
authentication and profile information out of Redis.

You now get to have third-party authentication without having to implement any of it. You are welcome.

Usage
======

* Set up Redis somewhere both your app and the microservice have access to it.
  * Make sure your Redis server has the `allkeys-lru` eviction policy, or it will eventually run out of memory.
* Have your app redirect the user to `/entry.html?platform=foobar&callback=url-encoded-return-url`
  * `platform` => the key for the platform you want to authenticate against (see below)
  * `callback` => the URL-encoded location to redirect the user to when authentication is successful
* On successful authentication, the user will be redirected to the URL specified by `callback` with a query parameter of `authToken`.
* Look up the value of `authToken` in `Redis`. This will give you a key consisting of the playform key, a colon (`:`), and then the user id. In
the example that follows, assume that key was `twitter:123456789`.
* There are three keys in Redis based in that key.
  * `twitter:123456789` - Contains the most recent authentication token generated for this user.
  * `twitter:123456789:auth` - Contains authentication information, which is platform-specific.
  * `twitter:123456789:profile` - The profile provided with that user, which is also platform-specific, but with [some standards](http://passportjs.org/docs/profile).

Platform Keys
===============

* [*Twitter*](https://dev.twitter.com/) => `twitter`
* [*Facebook*](https://developers.facebook.com/) => `facebook`
* [*Google*](https://console.developers.google.com/project) => `google`
* [*DropBox*](https://www.dropbox.com/developers/core/docs) => `dropbox`

Not (Yet) Implemented
----------------------
* *Amazon* => `amazon`
* *PayPal* (via OAuth) => `paypal`
* *Disqus* => `disqus`
* *Spotify* => `spotify`
* *Soundcloud* => `soundcloud`
* *Beatport* => `beatport`
* *Rdio* => `rdio`
* *Mixcloud* => `mixcloud`

Configuration
=================

This microservice uses [Configise](http://github.com/webonise/configise/) for configuration. The configuration options are as follows:

* `baseUrl` - The base URL for the microservice, necessary to generate callback URLs for OAuth.
* `platforms` - The platforms to load in this microservice.
* `redisSession` - Redis configuration
* `cookieSecret` — The secret to use for signing cookies.

In addition, there are specific configuration hashes for the various platforms, keyed off the platform keys.
