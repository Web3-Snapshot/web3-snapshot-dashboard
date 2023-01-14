/*
The react dev server tries to be smart and intercepts every HTTP call. If the
mime type is text/html that it will not do the proxy to the backend server. This
is fine as in most cases we set the headers correctly and call backend routes
from javascript. In the special case where we want to open a GET-link on the
backend via a traditional anchor tag, the browser automatically sets the
text/html header. This makes create-react-app believe the request does not need
to be proxied to the backend. Thus, the link is not followed and we see a 404 in
the frontend. We catch this edgcase here by explicitly not routing on the /api
route.

And here: https://github.com/facebook/create-react-app/issues/6031
See here: https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually
*/

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://backend:5000`,
      changeOrigin: true,
    })
  );
};
