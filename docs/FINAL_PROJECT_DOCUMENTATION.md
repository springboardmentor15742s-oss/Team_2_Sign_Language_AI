INFOSYS SPRINGBOARD INTERNSHIP 7.0
SignSpeak
Sign Language Learning & Assessment Platform
PROJECT DOCUMENTATION
Team 2  •  Mentor: Shravya
Dadi Amrutha  •  Janani P  •  Sanjay S  •  Chaitali Patil
Anurag Goud Seguri  •  Dheekshika S

Final Project Documentation
 
1. Project Information
Field	Details
Project Title	SignSpeak – Sign Language Learning & Assessment Platform
Program	Infosys Springboard Internship 7.0
Team	Team 2
Project Mentor	Shravya
Team Members	Dadi Amrutha; Janani P; Sanjay S; Chaitali Patil; Anurag Goud Seguri; Dheekshika S

Team member contact details:
Member	Email
Dadi Amrutha	amruthadadi050@gmail.com
Janani P	jananip1412@gmail.com
Chaitali Patil	patilchaitail843@gmail.com
Sanjay S	ssan.cse2024@rmd.ac.in
Anurag Goud Seguri	segurianuraggoud@gmail.com
Dheekshika S	dheekshika.tech@gmail.com

2. Abstract
SignSpeak is a web-based Sign Language Learning & Assessment Platform developed by Team 2 as part of the Infosys Springboard Internship 7.0. The platform is designed to support structured sign language learning, practice, gesture recognition, assessment, learner feedback, analytics, personalized learning, certification and reporting.
The project combines a React-based frontend, FastAPI-oriented backend services, PostgreSQL database support, and machine-learning/computer-vision workflows for sign language practice. The system uses sign language datasets including ASL and MNIST-related datasets as part of the data and recognition workflow.
Development was organized across four milestones. The first milestone established requirements, workflows, architecture, UI direction, authentication, learner profiles and datasets. The second focused on gesture recognition, hand tracking, assessment and accuracy evaluation. The third added AI feedback, analytics, recommendations, personalized learning plans and learner performance dashboards. The fourth concentrated on certification, reporting, testing, deployment and final documentation.
The final project outcome is an integrated SignSpeak platform with the major learner journey connected from authentication and learning through practice, assessment, analytics and certification. The frontend was deployed on Vercel and the backend/PostgreSQL stack was deployed on Railway.
3. Introduction
3.1 Background
Sign language is a visual form of communication and learning it requires repeated practice, clear examples and meaningful feedback. Digital learning platforms can reduce dependence on fixed learning sessions by allowing learners to practice in a structured environment.
SignSpeak explores the use of web technologies, computer vision and machine-learning workflows to make sign language learning and assessment more interactive. The platform is designed around the learner journey rather than treating recognition as an isolated technical component.
3.2 Problem Statement
Learners may have access to sign language learning materials but limited opportunities to continuously practice and objectively assess their own gestures. Traditional learning approaches can also depend on instructor availability for feedback.
The project addresses this challenge by providing a digital learning environment that connects lessons, practice, gesture recognition, assessment, feedback and progress tracking in one platform.
3.3 Objectives
•	Develop an interactive web platform for sign language learning and practice.
•	Provide structured learner workflows and profile management.
•	Identify, organize and integrate suitable sign language datasets.
•	Support hand tracking and gesture recognition workflows.
•	Provide sign assessment and performance evaluation.
•	Provide AI-assisted feedback to learners.
•	Track learner activity and performance through analytics.
•	Support personalized learning plans and recommendations.
•	Provide certification and reporting workflows.
•	Maintain professional documentation and collaborative version-control practices.
4. Scope
4.1 In Scope
•	Sign language learning and practice workflows.
•	Learner authentication and profile management.
•	ASL and MNIST-related dataset organization and integration.
•	Hand tracking and gesture recognition workflows.
•	Sign assessment and accuracy evaluation.
•	AI feedback and learning-intelligence workflows.
•	Learning analytics and learner performance dashboards.
•	Personalized learning plans and recommendations.
•	Certification and reporting.
•	Full-stack web application integration.
•	Cloud deployment and final validation.
4.2 Out of Scope
•	Universal recognition of every sign language and every possible sign.
•	Guaranteed recognition under all camera, lighting, background and occlusion conditions.
•	Replacement of professional sign-language instructors.
•	Clinical or formal accessibility certification of the system.
•	Recognition claims beyond what is supported by the implemented datasets and models.
5. Existing System & Proposed Solution
5.1 Existing System
Common sign language learning approaches include classroom instruction, videos, static images, online resources and dedicated learning applications. These resources can provide useful demonstrations, but continuous practice and automated assessment may not always be available in the same learning flow.
5.2 Proposed Solution
SignSpeak combines structured learning with technology-assisted practice and assessment. The learner can access learning content, perform practice activities, and move through recognition and assessment workflows. Assessment information is then connected to feedback, analytics and personalized learning.
5.3 Key Features
•	Authentication and learner access control.
•	Learner profile management.
•	Structured learning workflow.
•	Sign language dataset integration.
•	Hand tracking.
•	Gesture recognition.
•	Sign assessment.
•	AI feedback.
•	Learning analytics.
•	Personalized learning plans and recommendations.
•	Learner performance dashboard.
•	Certification and achievements.
•	Reports and notifications.
6. Technology Stack
Category	Technology / Approach
Frontend	React
Backend	FastAPI
Database	PostgreSQL
AI / ML	Machine Learning and Computer Vision workflows
Gesture Processing	Gesture recognition and hand tracking
API / Documentation	Backend APIs and Swagger documentation
Version Control	Git and GitHub
Frontend Deployment	Vercel
Backend / Database Deployment	Railway

7. System Architecture
The system follows a layered architecture in which the learner interacts with the frontend, the frontend communicates with backend services, and the backend coordinates application data and AI/ML-related processing.
User → React Frontend → FastAPI Backend → AI/ML & Application Services → PostgreSQL
The frontend is responsible for the learner-facing experience. Backend services handle application logic and API communication. AI/ML workflows support gesture-related processing and assessment. PostgreSQL provides persistent application data storage. The deployed system separates the frontend and backend/database environments.
7.1 System Modules
•	Authentication and Access Control – manages learner access and protected workflows.
•	Learner Profile – manages learner information and profile-related functionality.
•	Learning Module – supports the structured learning journey.
•	Practice Module – provides the learner with gesture practice activities.
•	Gesture Recognition – processes gesture input for recognition.
•	Hand Tracking – provides the hand-tracking workflow used during gesture processing.
•	Assessment – evaluates learner performance.
•	AI Feedback – provides feedback based on learner activity and assessment.
•	Learning Analytics – tracks performance and learning activity.
•	Personalization – supports recommendations and personalized learning plans.
•	Certification – supports certificate and achievement workflows.
•	Reporting – provides reporting functionality.
8. AI/ML Implementation
8.1 Dataset
The project researched and integrated sign language datasets for the AI/ML workflow. The documented datasets include the ASL Alphabet dataset and Sign-MNIST. The ASL dataset is image-based and organized by gesture classes, while Sign-MNIST is provided in CSV form for supervised machine-learning experimentation.
Dataset collection, exploration, organization and label/format analysis were completed as part of the early project milestones.
8.2 Data Processing
The data workflow included dataset collection, structure exploration, label and format analysis, organization of training/testing resources, and preparation for preprocessing and model development. Dataset responsibilities were coordinated sequentially so that collection and exploration supported later organization and recognition work.
8.3 Model / Algorithm
The implemented intelligent-processing direction uses computer vision, hand tracking and gesture recognition to connect visual input with sign assessment. The gesture-recognition work was integrated with the practice, feedback, assessment and reporting flow rather than being treated as an isolated model.
8.4 Training & Evaluation
The project includes assessment and accuracy-evaluation workflows. The available final project documentation does not provide a validated numerical accuracy, precision, recall or F1 score, so no unsupported metric is stated here. Final model metrics should be inserted from the team's validated experiment results if required for submission.
8.5 AI/ML Workflow
Input → Hand Tracking → Gesture Recognition → Sign Assessment → Feedback → Analytics
9. Database & API
9.1 Database
PostgreSQL is used as the persistent database layer in the deployed backend stack. The database supports application entities and information required for authentication, learner profiles, learning activities, practice, assessment, reports and related learner state.
The final production backend and PostgreSQL stack were deployed on Railway.
API responsibilities include authentication and access control, learner-profile operations, learning workflows, practice and assessment requests, feedback and analytics data, certification and reporting operations. Swagger documentation is included as part of the backend development and finalization workflow.
10. User Interface
The user interface is organized around a learner-focused journey. The major interface areas include authentication, learner profile, dashboard, learning, practice, assessment, feedback, analytics, personalized learning, certification and reports.
The UI development was carried out collaboratively. UI wireframes and learner-profile work were developed during the foundation milestones, followed by frontend implementation and integration with backend functionality.
Final screenshots of the deployed application should be inserted in this section as project evidence.
11. GitHub & Version Control
11.1 Repository
Field	Details
Repository	Team_2_Sign_Language_AI
Main Branch	main
Development Approach	Individual working branches followed by integration

11.2 Repository Structure
Team_2_Sign_Language_AI/
├── datasets/
├── docs/
├── frontend / application resources
├── backend / API resources
├── .gitignore
└── README.md
The repository structure evolved as implementation progressed. Large dataset resources were kept out of normal Git tracking where appropriate.
11.3 Version Control
•	Members worked on assigned tasks in separate branches.
•	Changes were committed with meaningful messages.
•	Branches were pushed for collaboration and integration.
•	Progress was reviewed before mentor sessions.
•	Integration issues were debugged collaboratively.
•	The main branch was protected from uncontrolled direct development.
12. Error Handling & Security
12.1 Error Handling
•	Invalid input is handled through application validation.
•	Authentication and access-control failures are handled through protected workflows.
•	API and integration failures are checked during testing and debugging.
•	Database and backend errors are addressed during integration testing.
•	Unclear or unsupported gesture input is treated as an assessment limitation rather than being presented as guaranteed recognition.
12.2 Security
•	Authentication and access control are included in the application.
•	Sensitive configuration should be maintained outside source code.
•	API access is controlled through backend application workflows.
•	Database access is handled through the backend rather than directly exposing database credentials to the frontend.
•	Production configuration includes environment-specific settings such as API base URLs and CORS.
13. Testing
Testing and validation were performed throughout development and were consolidated during the final milestone. The team checked API functionality, frontend-backend integration, authentication, learning, practice, assessment, reports, certification and deployment workflows.
The latest verified backend automated test suite recorded in the team documentation completed with 68 passing tests.
Testing was also used to identify integration issues involving environment configuration, CORS, API base URLs and database connectivity before final deployment.
14. Results
14.1 AI/ML Results
The project established and integrated gesture recognition, hand tracking and sign-assessment workflows. Numerical AI/ML performance metrics are not included because the provided project record does not contain a validated final accuracy, precision, recall or F1 score.
14.2 System Results
•	A working full-stack SignSpeak platform was integrated across UI, backend, database, datasets, gesture recognition, analytics and documentation.
•	The frontend was deployed on Vercel.
•	The backend and PostgreSQL stack were deployed on Railway.
•	Practice and assessment workflows were integrated with the wider learner journey.
•	Certification, reports and achievements were included in the final application.
•	The latest verified backend test suite recorded 68 passing tests.
Screenshots, deployment evidence and final assessment outputs should be included here for the final submission package.
14.3 Milestone-wise Task Completion Progress
Milestone	Weeks	Focus	Status
Milestone 1	1–2	Objectives, workflows, architecture/schema, UI wireframes, React/FastAPI setup, authentication/RBAC, learner profiles and datasets	Completed
Milestone 2	3–4	Gesture recognition, hand tracking, assessment models, accuracy evaluation and reports	Completed
Milestone 3	5–6	AI feedback, analytics, recommendations, personalized learning plans and learner dashboard	Completed
Milestone 4	7–8	Certification, reporting, testing, deployment, Swagger and final documentation	Completed

Milestone 1 – Foundation: The team established the project direction, requirements, learning workflow, architecture, UI direction, application foundation, authentication, learner profiles and dataset base.
Milestone 2 – Recognition & Assessment: The team progressed into gesture recognition, hand tracking, assessment and accuracy-evaluation workflows and connected these areas with practice and reporting.
Milestone 3 – Learning Intelligence: The project was extended with AI feedback, learning analytics, recommendations, personalized learning plans and learner performance views.
Milestone 4 – Finalization: The team completed certification and reporting workflows and concentrated on testing, deployment, Swagger, integration validation and final documentation.
15. Deployment
The final production path recorded in the team documentation uses Vercel for the frontend and Railway for the backend/PostgreSQL stack.
Final deployment readiness included checking environment variables, CORS configuration, API base URLs, database connectivity and production Swagger. These checks were performed as part of the final integration and validation process.
16. Challenges & Limitations
•	Coordinating work across frontend, backend, database, datasets, ML and documentation.
•	Handling different sign-language dataset structures and formats.
•	Managing large datasets without treating them as ordinary source-code files.
•	Connecting gesture recognition and hand tracking to the practice and assessment workflow.
•	Maintaining consistent learner state across analytics, recommendations and certification.
•	Resolving frontend-backend integration and environment configuration issues.
•	Maintaining documentation while implementation was changing.
•	Ensuring that final claims were supported by implementation evidence and verified test results.
Recognition performance may also vary with real-world conditions such as camera quality, lighting, background, hand orientation and occlusion. The available project record does not establish universal recognition performance.
17. Future Scope
•	Expand the supported sign vocabulary and datasets.
•	Improve recognition robustness across lighting, background and camera conditions.
•	Extend from isolated signs toward continuous gesture and sentence-level recognition.
•	Improve personalized learning recommendations using richer learner history.
•	Add more detailed educator and learner analytics.
•	Expand accessibility and user-experience testing.
•	Scale the deployed architecture for larger user populations.
•	Improve model optimization for faster inference.
•	Add additional learning resources and gamification features.
•	Extend the platform to additional sign languages after appropriate dataset and model validation.
18. Conclusion
SignSpeak was developed as an AI-assisted Sign Language Learning & Assessment Platform under the Infosys Springboard Internship 7.0. The project combines learning workflows, learner management, datasets, computer vision, gesture recognition, assessment, feedback, analytics, personalization, certification and reporting.
The four-milestone development approach enabled the team to move from requirements and research to implementation, intelligent assessment, learning intelligence and final deployment. The project also established a collaborative Git-based workflow and maintained technical documentation alongside development.
The final integrated system provides a foundation for accessible and measurable sign language learning. Further improvements can focus on model validation, recognition robustness, broader datasets, richer personalization and continued production-scale refinement.
19. References
•	Infosys Springboard Internship 7.0 project requirements and mentor guidance.
•	ASL Alphabet dataset used for sign-language image data exploration and recognition development.
•	Sign-MNIST dataset used for supervised sign-language machine-learning experimentation.
•	React documentation and web-development resources used for frontend development.
•	FastAPI documentation and API-development resources used for backend services.
•	PostgreSQL documentation and database resources.
•	Git and GitHub documentation for version control and collaborative development.
•	Computer vision and hand-tracking resources used for gesture-processing workflows.
•	Swagger / OpenAPI documentation resources used for API documentation and validation.
•	Vercel and Railway deployment documentation/resources used for production hosting.
