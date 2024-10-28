1. implement a user login and an organization login
    * the type of user should determine what page is shown (user or org dashboard)

2. Creating schedules with the same name throws an exception that is not handled
    - should either display a message or automatically "edit" the schedule and add the new events to the existing schedule

3. Hardcoded JWT secret is used in application.properties
    - In production, you store this secret securely in an environment variable or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, etc.).