SVG-to-PNG Microserver
===========================

This microserver simply turns an SVG file into a PNG file. That conversion can be memory intensive, so you don't want to do it on your same server as your
web requests. This allows you to unload the work easily, so the server can be in its own (auto-scaling) cloud.

Usage
--------

Put the files in this folder on your server. Install Node.js and `npm`. Run `npm install` in this folder. Run `node server.js` to run the server. The server
will be running on port 9876. Post an SVG file in a multipart form upload to `/convert`: it should be in the `file` parameter. (The `test.html` file demonstrates
doing this from HTML.) The responses will be the SVG file converted into PNG.

TODO
--------

* Integrate Configise for configuration. (Maybe the `microserver` module should do that?)
* Add some kind of verification of the body in the unit tests, even if that is simply comparing the bytes and ensuring they are consistent.
* Create a raw TCP/IP server that accepts GZipped SVG files and returns the PNG file. This approach would be significantly faster, but does not permit any customization.
* Add in PNG optimization.
    * Enable the REST endpoint to disable PNG optimization.
* Enable the REST endpoint to resize the SVG.
