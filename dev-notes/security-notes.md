## How Spring Security Determines if a User is Logged In

1. Session-Based Authentication:
* When a user logs in (through a custom authentication method, since form login is disabled), Spring Security creates a session or uses cookies (like JSESSIONID), which keeps track of the authenticated user.
* This session is stored on the server, and each subsequent request contains a session identifier that Spring Security uses to check if the user is authenticated.
* The anyRequest().authenticated() rule in your config ensures that, for any request (other than the ones allowed by .permitAll()), Spring will check if the session has an authenticated user.

2. Security Context:
* Spring Security stores the user's authentication details in a SecurityContext object. This context is managed by the SecurityContextHolder.
* When a user successfully logs in, their Authentication object is stored in this context, and Spring Security uses it to authorize access to protected resources.
* For each request, Spring checks the SecurityContext for an authenticated user. If it finds one, the request is allowed; otherwise, it is denied, and the user might be redirected to the login page.

3. CSRF Token (if enabled):
* Though CSRF is currently disabled in this configuration (for development purposes), typically Spring also uses a CSRF token to prevent cross-site request forgery attacks. This token is part of the session and ensures that form submissions or state-changing actions come from authenticated users.

4. Custom Authentication Logic:

* note form login is currently disabled with .formLogin(form -> form.disable())
* When the user logs in via the /api/auth/login endpoint, if the credentials are valid, Spring Security authenticates the user and establishes a session or returns a token that will be used for subsequent requests to prove the user's identity.

## How Spring Security Accepts or Denies Requests
* If the user is authenticated:
    * The session or token for the authenticated user is checked. If valid, requests are allowed to proceed to any endpoint protected by .anyRequest().authenticated().
* If the user is not authenticated:
    * If a request is made to an endpoint that requires authentication and no valid session/token is present, the user will be denied access (typically with a 401 Unauthorized response).
    * The permitted endpoints like /api/auth/login or /api/auth/register allow unauthenticated access, so users can log in or register.

## How to Test This
1. Check Authentication Status:
* You can check whether the user is authenticated by inspecting the session or authentication object using:
```
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
if (authentication != null && authentication.isAuthenticated()) {
    // User is authenticated
}
```

2. Inspect the Request Headers:
* If you're using cookies or tokens (like JWTs), ensure that these are sent with each request. For example, if your app uses JWT, make sure the Authorization header is set correctly:
```
Authorization: Bearer <token>
```

3. Front-End Testing:
* When you bypass the login page, ensure that the session or token is correctly being passed to the backend for protected requests. You could check the network tab in your browser to verify the correct headers or cookies are being sent.