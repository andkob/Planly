1. implement a user login and an organization login
    * the type of user should determine what page is shown (user or org dashboard)

2. User authentication is not working
    - at the moment im using HttpSessions to try to validate users
    - I want to switch to JWT authentication

3. Hardcoded JWT secret is used in application.properties
    - In production, you store this secret securely in an environment variable or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, etc.).