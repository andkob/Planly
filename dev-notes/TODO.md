1. Creating schedules with the same name throws an exception that is not handled
    - should either display a message or automatically "edit" the schedule and add the new events to the existing schedule

2. Hardcoded JWT secret is used in application.properties
    - In production, you store this secret securely in an environment variable or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, etc.).

3. Create default event types, and allow for custom event types.

4. Create a display when a user doesn't have any schedules yet.

5. Schedule events should be able to be repeated. Also it's only IMPLIED rn that schedules are WEEKLY
    - Real schedules should be easier to maintain i think but rn Weekly is fine.

