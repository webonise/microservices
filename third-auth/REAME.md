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

Pick your third party authentication system of choice, and look up its key in the list below. For the examples that follow, we will assume
the key for the third party authentication system is 'foobar'.

Configuration
=================

This microservice uses [Configise](http://github.com/webonise/configise/) for configuration. The configuration options are as follows:

* `cookieSecret` — The secret to use for signing cookies.
* `authKeyTtlSeconds` — How long an authentication key should live after it is created, in seconds.
