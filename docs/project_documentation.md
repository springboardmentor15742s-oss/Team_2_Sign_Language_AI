AI Powered Sign Language Learning & Assessment Platform

1. Project Overview:

The AI Powered Sign Language Learning & Assessment Platform is a web-based application designed to help learners learn and practice sign language through structured lessons, gesture recognition, assessments, and performance feedback.

The platform combines Artificial Intelligence, Computer Vision, Machine Learning, and modern web technologies to provide an interactive and accessible learning environment.

The system is designed to recognize sign language gestures, evaluate learner performance, and provide meaningful feedback to help users improve their signing skills.

This project is being developed as part of the Infosys Springboard Virtual Internship Program.

2. Problem Statement:

Sign language is an important means of communication for millions of people. However, access to structured learning resources and personalized practice support can be limited.

Traditional learning methods often depend on instructors and provide limited opportunities for continuous practice and performance evaluation.

The proposed platform addresses these challenges by allowing learners to practice sign language independently while using AI-based technologies to recognize gestures, evaluate their performance, and provide feedback.

3. Project Objectives:

The major objectives of the project are:

Build an interactive sign language learning platform.

Enable AI-based sign language gesture recognition.

Develop computer vision based hand tracking workflows.

Provide gesture-based learning and practice.

Evaluate learner performance using assessment models.

Calculate and present recognition and assessment accuracy.

Track learner progress through assessments.

Provide a foundation for intelligent feedback.

Improve accessibility through AI-powered learning technologies.

4. Technology Stack:

4.1 Frontend:

React.js

HTML5

CSS3

JavaScript

4.2 Backend:

FastAPI

Python

4.3 Database:

PostgreSQL

4.4 Machine Learning and Computer Vision:

TensorFlow

MediaPipe

OpenCV

NumPy

Pandas

Scikit-learn

4.5 Version Control:

Git

GitHub

5. System Modules:

The project is divided into three major areas.

5.1 Frontend Module:

The frontend provides the user-facing learning environment.

Major components include:

User Authentication

Learner Dashboard

Lesson Interface

Practice Interface

Assessment Interface

Learner Profile

Progress Tracking

Performance Results

5.2 Backend Module:

The backend manages application logic, APIs, user information, assessments, and progress-related operations.

Major components include:

Authentication APIs

Lesson APIs

Assessment APIs

User Management

Progress Tracking

Database Integration

Performance Data Management

5.3 Machine Learning Module:

The Machine Learning module forms the core of the AI functionality.

It includes:

Dataset Preparation

Data Preprocessing

Hand Tracking

Gesture Recognition

Sign Classification

Assessment Model

Prediction Engine

Accuracy Evaluation

6. Datasets Used:

6.1 ASL Alphabet Dataset:

The ASL Alphabet Dataset is used for recognizing static American Sign Language alphabet gestures.

The dataset contains:

29 classes

RGB images

Alphabet signs

Additional gesture classes such as del, nothing, and space

Training and testing data

The dataset provides the image-based foundation required for developing and testing the gesture recognition system.

6.2 Sign Language MNIST Dataset:

The Sign Language MNIST Dataset is used as an additional dataset for gesture classification and model evaluation.

It contains:

sign_mnist_train.csv

sign_mnist_test.csv

28 × 28 grayscale images

Pixel values

Label information

The dataset is used for benchmarking classification performance and evaluating gesture classification models.

7. Milestone 1 – Completed Work:

During the first milestone, the team established the basic project and machine learning foundation.

The major completed activities included:

Dataset organization

Dataset analysis

Dataset documentation

Initial preprocessing pipeline

Training, validation, and testing data preparation

System architecture

Learning workflow

UI wireframes

Database schema

API documentation

Installation documentation

Backend project setup

Frontend authentication

Learner profile management

8. Milestone 2 – AI and Assessment Development:

Milestone 2 focused on developing the AI and Computer Vision components of the Sign Language Learning and Assessment Platform.

The following tasks were completed during this milestone:

Implement Gesture Recognition Engine

Build Hand Tracking Workflows

Develop Sign Assessment Models

Create Accuracy Evaluation Systems

These components extend the initial machine learning foundation and move the project toward actual sign recognition and learner assessment.

9. Gesture Recognition Engine:

The gesture recognition engine is responsible for identifying the sign represented by the learner's hand gesture.

The recognition workflow processes the input gesture and determines the corresponding sign class.

The main workflow is:

Input Image / Gesture
        ↓
Image Preprocessing
        ↓
Hand / Gesture Detection
        ↓
Feature Extraction
        ↓
Gesture Classification
        ↓
Predicted Sign

The recognition engine is designed to work with the prepared sign language datasets and classification models.

The output of the recognition system is the predicted sign or gesture class.

For example:

Input Gesture
      ↓
Recognition Engine
      ↓
Predicted Class
      ↓
"A"

This component forms the foundation for the practice and assessment functionality of the platform.

10. Hand Tracking Workflow:

Hand tracking is an important part of sign language recognition because the position and movement of the hand provide information required to identify a sign.

The hand tracking workflow processes hand-related visual information before sending it to the recognition and assessment components.

The workflow can be represented as:

Camera / Image Input
        ↓
Frame Capture
        ↓
Hand Detection
        ↓
Hand Landmark / Position Tracking
        ↓
Feature Processing
        ↓
Gesture Recognition

The workflow helps the system identify relevant hand information and provides structured input to the gesture recognition engine.

This creates a connection between the visual input and the machine learning classification stage.

11. Sign Assessment Models:

The sign assessment component is responsible for evaluating whether the learner has performed the expected sign correctly.

The assessment process compares the learner's predicted gesture with the expected sign.

The basic workflow is:

Expected Sign
      ↓
Learner Performs Sign
      ↓
Gesture Recognition
      ↓
Predicted Sign
      ↓
Comparison
      ↓
Assessment Result

The assessment system can determine whether the performed sign matches the expected sign.

For example:

Expected Sign : A
Predicted Sign: A

Result: Correct

If the predicted sign does not match the expected sign:

Expected Sign : A
Predicted Sign: B

Result: Incorrect

This provides the foundation for interactive learner assessments.

12. Accuracy Evaluation System:

An accuracy evaluation system was created to measure the performance of the sign recognition and assessment models.

The evaluation system compares:

Actual / Expected Labels
          ↓
       Compare
          ↑
Predicted Labels

Based on this comparison, the system can evaluate model performance using standard classification metrics.

The evaluation framework includes:

Accuracy

Precision

Recall

F1 Score

Confusion Matrix

Class-wise performance

Accuracy

Accuracy represents the proportion of correctly classified samples among all evaluated samples.

Accuracy =
Correct Predictions
-------------------- × 100
Total Predictions

Precision

Precision measures how many of the samples predicted as a particular class were actually correct.

Recall

Recall measures how many of the actual samples belonging to a class were correctly identified.

F1 Score

F1 Score provides a combined measure of precision and recall.

Confusion Matrix

A confusion matrix helps identify which sign classes are being correctly recognized and which classes are being confused with one another.

13. Overall AI Workflow:

The Milestone 2 AI workflow can be represented as follows:

                 ┌─────────────────┐
                 │ Image / Camera  │
                 │     Input       │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Image / Frame   │
                 │  Preprocessing  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │  Hand Tracking  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Feature / Hand  │
                 │  Information    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │    Gesture      │
                 │  Recognition    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Sign Prediction │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │     Sign        │
                 │   Assessment    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │    Accuracy     │
                 │   Evaluation    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Performance /   │
                 │ Feedback Result │
                 └─────────────────┘

14. Machine Learning Data Workflow:

The machine learning data pipeline follows the following process:

Raw Dataset
     ↓
Dataset Organization
     ↓
Image / Data Preprocessing
     ↓
Normalization
     ↓
Label Preparation
     ↓
Train / Validation / Test Split
     ↓
Model Training
     ↓
Model Prediction
     ↓
Model Evaluation

For image-based datasets, preprocessing includes resizing images, converting image formats where required, and normalizing pixel values.

The processed data is then divided into training, validation, and testing sets.

15. Dataset Preprocessing:

The preprocessing pipeline prepares the datasets for machine learning.

For the ASL Alphabet dataset, the preprocessing workflow includes:

Reading input images

Converting image color format

Resizing images

Normalizing pixel values

Assigning numerical labels

Splitting the data into training, validation, and testing sets

Saving processed images and labels

For Sign Language MNIST:

CSV files are loaded

Labels are separated from image pixels

Pixel data is reshaped into image dimensions

Pixel values are normalized

Training and validation data are separated

Processed datasets are stored for model development

16. Model Evaluation Workflow:

The model evaluation process follows a standard machine learning evaluation pipeline.

Test Dataset
     ↓
Trained Model
     ↓
Generate Predictions
     ↓
Compare Predictions
with Actual Labels
     ↓
Calculate Metrics
     ↓
Generate Evaluation Report

The evaluation results can be used to identify model strengths and weaknesses.

The confusion matrix and class-wise performance are particularly useful for identifying signs that are frequently confused by the model.

17. Milestone 2 Deliverables:

The following deliverables were completed as part of Milestone 2.

AI Development

Gesture Recognition Engine

Hand Tracking Workflow

Sign Recognition Pipeline

Sign Assessment Model

Prediction and Classification Workflow

Accuracy Evaluation System

Dataset and ML Support

Dataset preprocessing support

Training, validation, and testing data preparation

Label handling

Model evaluation workflow

Assessment Support

Expected sign and predicted sign comparison

Correct/incorrect assessment

Performance metric calculation

Class-wise evaluation

Confusion matrix based evaluation

18. Current Project Status:

After completing Milestone 2, the project has progressed from the initial platform and dataset foundation toward the core AI-powered sign recognition and assessment functionality.

Completed

System Architecture

Learning Workflow

UI Wireframes

Database Schema

API Documentation

Installation Guide

Frontend Authentication

Learner Profile Management

Backend Project Setup

Dataset Organization

Dataset Analysis

Dataset Documentation

Dataset Preprocessing

Gesture Recognition Engine

Hand Tracking Workflow

Sign Assessment Models

Accuracy Evaluation System

Next Development Areas

The next stage of development will focus on integrating the individual components into a complete end-to-end learning experience.

Planned work includes:

Integration of AI models with the backend

Connecting gesture recognition with the practice interface

Real-time camera-based recognition

Integration of assessment results with learner profiles

AI-generated feedback

Progress analytics

End-to-end testing

Model improvement and optimization

19. Repository Structure:

The project follows a modular repository structure:

Team_2_Sign_Language_AI
│
├── backend
│
├── docs
│
├── ml
│   ├── preprocessing
│   ├── utils
│   ├── models
│   └── evaluation
│
├── signspeak-frontend
│
├── datasets
│
└── README.md

20. Team Development Workflow:

The project follows a collaborative GitHub-based development workflow.

Each team member:

Creates or works on an assigned Git branch.

Develops the assigned feature.

Tests the implementation.

Commits the changes.

Pushes the changes to GitHub.

Creates a Pull Request when required.

Performs review and integration with the main project.

This workflow allows team members to work independently while reducing the risk of affecting the main branch.

21. Challenges Addressed During Milestone 2:

During the development of the AI components, one of the main challenges was connecting the different stages of the machine learning workflow.

The project required a clear flow between:

Dataset
   ↓
Preprocessing
   ↓
Hand / Gesture Information
   ↓
Recognition
   ↓
Assessment
   ↓
Evaluation

Another important consideration was ensuring that the evaluation process can be used to assess model performance independently.

The development therefore focused on creating modular components that can be integrated together as the project progresses.

22. Future Enhancements:

The following features are planned for future development:

Live Camera Recognition

Real-time Sign Language Translation

Personalized Learning Paths

AI-generated Feedback

Detailed Progress Analytics

Voice Assistance

Gamification

Certificate Generation

Model Optimization

Support for additional sign language datasets

Improved recognition of continuous sign language

23. Conclusion:

Milestone 2 focused on developing the core Artificial Intelligence and Computer Vision capabilities required for the Sign Language Learning and Assessment Platform.

The team progressed from the initial dataset and machine learning foundation to the development of gesture recognition, hand tracking, sign assessment, and accuracy evaluation capabilities.

The completed work provides the technical foundation required for integrating AI-based sign recognition into the learning and assessment platform.

The next phase will focus on integrating these AI components with the frontend and backend, enabling real-time interaction, learner feedback, performance tracking, and a complete end-to-end sign language learning experience.

Overall, the project is progressing toward its goal of providing an accessible, intelligent, and interactive platform for sign language learning and assessment.