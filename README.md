# Planly

Planly is a web application designed as a centralized hub for coordinating and managing schedules within groups such as fraternities and other organizations. It plans to facilitate efficient event planning by visualizing overlapping availabilities. Future features will include creating and managing events, tracking upcoming activities, and enhancing communication among members. By building on the foundation of individual schedules, this application aims to streamline coordination and promote collaboration within the group.



## Features
- **JWT Authentication** for secure access to the application.
- **Dynamic Scheduling**: Users can create and manage schedules to visualize overlapping availabilities.
- **Backend** implemented using the **Spring Boot** framework.
- **H2 Database** for lightweight and fast in-memory or file-based storage
- **ORM Framework (JPA)** for seamless data persistence and object-relational mapping.
- **Frontend** built with **React**.
- **Maven** for build and dependency management.
- Future support for **OAuth 2.0** integration with Google Services.

## 🚧 Getting Started
***Note:** This project is currently in development. Please follow the instructions below only if you are interested in building on it or trying out the existing features.*

### Prerequisites

Before running the application, ensure that you have the following installed:
- **Java JDK 21** or later
- **Maven** for project building and dependency management
- The latest version of **npm** (node package manager)

### Project Structure
(*omitted for now*)

### Running the Application
The following steps will walk through how to set up the project and run it. You will connect to the React dev server, which is currently the front-end access point.
1. Clone the repository
```bash
$ git clone https://github.com/andkob/Planly.git
$ cd Planly
```
2. Build the project with maven
(*must be run with the -DskipTests flag cuz all the tests will fail and the build process will explode*)
```bash
$ mvn clean install -DskipTests
```
3. Generate and add a JWT secret to application.properties

*This is a temporary solution for development only*
* If you're on Linux of macOS, you can generate a random secret key with the following command:
    ```bash
    $ openssl rand -base64 32
    ```
    Or you can use the provided **JwtSecretGenerator.java** class located at
    > src/main/java/com/melon/app/security/JwtSecretGenerator.java
* Copy the generated secret and hardcode it into the **application.properties** file (located in resources)
```properties
jwt.secret=YourSuperSecretKeyThatIsHardToGuess
```
4. From the project root directory, run the backend server (*requests will be handled on port 8080*)
```bash
$ mvn spring-boot:run
```
5. Open a new terminal and install the frontend dependencies
```bash
$ cd src/main/webapp/frontend
$ npm install
```
6. From the same directory, start the React development server
```bash
$ npm start
```
7. Access the app at `http://localhost:3000`

### Using Google OAuth 2.0
(currently in development)
- Integration with Google OAuth 2.0 may provide enhanced authentication options.
- Integration with Google Calendar to manage events and schedules.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.