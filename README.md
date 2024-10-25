# XBCAD-API

## GROUP MEMEBERS (Contributors)
### Nkosinathi Ngozo - ST10215069
### Thobani Khumalo - ST10092282
### Samendra Morgan - ST10092045


## Main project repository
- App Code repo - https://github.com/system-sculpters/XBCAD7319.git
- Rest Api Repo - https://github.com/system-sculpters/XBCAD-API.git


# Recommended System requirements
- windows 8-11
- minimum of 8 GB of free hard disk space
- Fast processor
- 2GB of ram

# Compiling software
- Android Studio

# Running software
- Copy the repository link from github
- Open Android studio
- Click the 'Get from VCS' button
- Paste the link URL input field
- Click the 'Clone' button
- Click on the 'Trust Project' button
- Allow the Gradle files to be configured
- Once the Gradle files are configured click on the green 'play' Button to run the project

## Technology Stack
- Frontend: Kotlin (for Android app development)
- Backend: Node.js with Express for the api
- Database: Firebase Firestore
- Version Control: Git
- CI/CD: GitHub Actions


## Design Considerations
The app's design prioritizes both usability and security. Key design considerations include:

### API Design Principles

![Screenshot 2024-10-25 204526](https://github.com/user-attachments/assets/0100e8ba-8ad1-4e2a-b5dd-7a57612f8a08)


- RESTful Design: Follow RESTful principles, such as using appropriate HTTP methods (GET, POST, PUT, DELETE), and ensuring stateless interactions.

- Consistent Error Responses: Design a consistent error response format to make it easy for developers to handle errors. Include meaningful error codes and messages.

- Ease of Use: Ensure the API is intuitive and easy to use, with logical endpoint naming and clear request/response structures.

- Efficient Querying: Optimize queries to the Firebase database to ensure fast data retrieval. Use Firebase's indexing and querying capabilities to improve performance for large datasets.

- Authentication and Authorization: Implement Firebase Authentication to manage user identities securely. Ensure that API endpoints are protected so that users can only access their own data. Use Firebase's security rules to enforce data access controls based on user roles and permissions.


![Screenshot 2024-10-25 203927](https://github.com/user-attachments/assets/2c12504a-7eea-447e-b964-f70916adee07)


### Role Design:
- The app consists of 3 users (user, agent and admin)

#### ADMIN
- admin is provide with a dashboard on startup
- They have the power to give and revoke user status (changing user to agent and agent to user)

#### AGENT
- Agents havethe ability to create, read and delete properties
- They have access to the chat feature which allows them to communicate with users who asked for a valuation or enquired about a specific property
- They arealso able to change the status of an evaluation


#### USER
- Users are able to view properties and bookmark them
- Users are also able to enquire about a property and this gives them the ability to communicate with an agent through the chat feature
- Users have the ability to request an evaluation for their property allowing them to chat with an agent
- The user is also able to buy a property on the system as long as they have the funds


## GitHub Utilisation
PennyWise’s development will be version-controlled and managed through GitHub, following best practices for code collaboration and maintenance. The GitHub repository will include:

- Version Control: Both the API and the main application have their own repositories to manage their source code independently. This separation allows for focused development and version tracking specific to each component. The API repository contains the backend code, including business logic, database interactions, and RESTful endpoints. The main application repository contains the front-end code, such as user interfaces and client-side interactions. This setup supports independent updates and deployments, facilitating better management of changes and minimizing potential conflicts between the API and application.
- API
![Screenshot 2024-10-25 204526](https://github.com/user-attachments/assets/9407ffd3-ee77-4a93-b633-fe777ac6b43a)


- APPLICATION
![Screenshot 2024-10-25 205506](https://github.com/user-attachments/assets/34765596-b10f-471f-9851-146861e68156)



- API Deployment Automation: Render is configured to automatically deploy your API whenever there are updates to the repository.

![Screenshot 2024-10-25 203821](https://github.com/user-attachments/assets/9ceb3f6a-870d-4e5d-907e-dd8f5de768ee)



- Pull Requests (PRs): Pull Requests will be used to review code and ensure that the codebase remains stable. Each PR will be reviewed and tested before being merged into the main branch.



- Documentation: The repository will include detailed README files, API documentation, and setup instructions, making it easy for new developers to contribute to the project. Documentation will also cover database schema, API endpoints, and app architecture.



## GitHub Actions


- GitHub Actions is a powerful feature integrated into GitHub that automates workflows within the development proces. By using GitHub Actions, developers we created workflows that respond to various events in our repository, such as pushes and pull requests. Here are some key functionalities of GitHub Actions utilized in this project:

- Continuous Integration
Continuous Integration (CI) is a practice that encourages developers to integrate their changes into the main codebase frequently. With GitHub Actions, CI is automated to ensure that the application is built and tested every time code is pushed to the repository or a pull request is created. This process involves several steps:

- Automatic Build: Whenever changes are pushed, GitHub Actions triggers a build process that compiles the application. This ensures that the new code integrates smoothly with the existing codebase without introducing compilation errors.

- Code Quality Checks: During the build process, automated checks are run to analyze the code quality. These checks help maintain coding standards across the project.

- Unit Testing Execution: Whenever code is pushed or a pull request is created, GitHub Actions automatically triggers the execution of unit tests. These tests validate the functionality of individual components of the application, ensuring that each part behaves as expected.


![Screenshot 2024-10-25 204248](https://github.com/user-attachments/assets/f4117a3e-7b45-4aac-9822-311969f3e406)


![Screenshot 2024-10-25 204356](https://github.com/user-attachments/assets/89282ec6-d1dd-425f-b713-e1a2abc53841)


![Screenshot 2024-10-25 204200](https://github.com/user-attachments/assets/5803f594-ecdd-44ca-b4e1-2f0d311c9c28)


![Screenshot 2024-10-25 204428](https://github.com/user-attachments/assets/ce2c0651-d26e-4e6e-b4e5-b08e3a3ccf29)


## APP TESTS
- The API was tested with the use of sonarqube to check for vulnerabilities. Sonarcube connects directly to the api repo and evelautes the code as a whole.

![Screenshot 2024-10-25 204607](https://github.com/user-attachments/assets/09d3c33b-538b-4a55-9432-7004f7da192f)

- The application was tested the use of github actions. this ran build and unit tests.
  
![Screenshot 2024-10-25 204200](https://github.com/user-attachments/assets/715cf6ed-650d-4bb4-b460-e02f5c7f4fd1)

![Screenshot 2024-10-25 204428](https://github.com/user-attachments/assets/5732e0e1-5f3b-40b3-bbbd-1a74eb076a93)





