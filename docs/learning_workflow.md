# Learning Workflow

## Overview
The SignBridge Learning Workflow helps users learn Indian Sign Language through interactive lessons and AI-based assessment.

## Workflow

Detailed Workflow Steps:
1. User Authentication & Goal Setup: The user logs in and chooses their experience level (e.g., Beginner ASL Alphabet) [3, 6].
2. Instructional Delivery: The user is presented with static images or tutorial videos showing how to sign a specific character or word [3].
3. Capture Feed: When ready, the user clicks "Start Practice," activating their device's webcam.
4. Processing & Tracking (MediaPipe): The frames are captured and evaluated to retrieve hand landmarks (such as joint angles and wrist positions) [4, 5].
5. AI Inference & Evaluation: The coordinates of the landmarks are passed to the AI model [2]. The backend evaluates correctness by checking hand shape, movement accuracy, position, and timing [5].
6. Instant Response Feedback: The frontend displays instantaneous corrective notes (e.g., "Incorrect Motion" or "Great, keep holding!") [5, 6].
7. Performance Scoring & Analytics: Upon completing the practice session, progress tracking values are calculated via the weighted performance scoring model and saved 

## Workflow Diagram


+-------------------+      1. Login & Choose Lesson      +--------------------------+
|  Learner UI       | ---------------------------------> |   Course Management DB   |
|  (React/Next.js)  |                                    |   (PostgreSQL/MongoDB)   |
+-------------------+                                    +--------------------------+
          ^                                                            |
          | 6. Visual Real-time Feedback & Scores                      | 2. Fetch Demonstration Video
          |                                                            v
+-------------------+      3. Capture Frames via Webcam  +--------------------------+
|  Webcam Input     | ---------------------------------> |  Frontend Video Stream   |
|  (HTML5 Media API)|                                    |  (via REST or WebSocket) |
+-------------------+                                    +--------------------------+
                                                                       |
                                                                       | 4. Process Raw Stream
                                                                       v
+-------------------+      5. Evaluate Landmarks & Signs +--------------------------+
|  AI/ML Engine     | <--------------------------------- |   MediaPipe Engine       |
|  (CNN/LSTM Model) |                                    |   (Hand & Pose Landmarks)|
+-------------------+                                    +--------------------------+