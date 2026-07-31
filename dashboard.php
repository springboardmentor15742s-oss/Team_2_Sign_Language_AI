<?php
session_start();

if(!isset($_SESSION['email']))
{
    header("Location:index.php");
    exit();
}

/*
    Learner information from session
*/
$fullname = $_SESSION['fullname'];
$email = $_SESSION['email'];
$level = $_SESSION['course'];

/*
    Sign Language learner dashboard data
    These are currently sample values for UI design.
    Later they can be connected to database/AI assessment results.
*/

$preferred_language = "American Sign Language (ASL)";

$learning_goal = "Improve everyday sign language communication";

$progress = 65;

$accuracy = 82;

$practice_sessions = 18;

$assessments_completed = 6;

$skills_mastered = 12;
?>

<!DOCTYPE html>
<html>

<head>

<title>Sign Language Learning & Assessment</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial,sans-serif;
}

body{
    background:#f5f3ff;
    color:#222;
}

/* HEADER */

.header{
    background:linear-gradient(135deg,#7b4dff,#6a3df0);
    color:white;
    padding:20px 40px;

    display:flex;
    justify-content:space-between;
    align-items:center;

    box-shadow:0 3px 10px rgba(0,0,0,0.15);
}

.header h1{
    font-size:28px;
}

.logout-btn{
    background:white;
    color:#6a3df0;

    padding:10px 22px;

    text-decoration:none;

    border-radius:8px;

    font-weight:bold;
}

.logout-btn:hover{
    background:#f0ebff;
}


/* MAIN CONTAINER */

.container{
    width:94%;
    max-width:1400px;

    margin:30px auto;
}


/* PROFILE + PROGRESS */

.profile-section{
    display:flex;
    gap:25px;

    margin-bottom:30px;
}


/* COMMON CARD */

.card{
    background:white;

    border-radius:16px;

    padding:28px;

    box-shadow:0 4px 12px rgba(0,0,0,0.08);
}


/* PROFILE */

.profile-card{
    width:35%;
}

.profile-card h2{
    color:#6a3df0;

    margin-bottom:20px;
}

.profile-card p{
    margin-bottom:12px;

    font-size:16px;
}

.profile-info{
    margin-top:20px;
}

.info-item{
    background:#f8f6ff;

    padding:12px;

    margin-bottom:10px;

    border-radius:8px;
}

.level-badge{
    display:inline-block;

    background:#7b4dff;

    color:white;

    padding:8px 18px;

    border-radius:20px;

    margin-top:10px;

    font-weight:bold;
}


/* PROGRESS */

.progress-card{
    width:65%;
}

.progress-card h2{
    color:#6a3df0;

    margin-bottom:20px;
}

.progress-bar{
    width:100%;

    height:25px;

    background:#e4e4e4;

    border-radius:20px;

    overflow:hidden;

    margin-top:15px;
}

.progress{
    width:65%;

    height:100%;

    background:linear-gradient(
        90deg,
        #7b4dff,
        #9a72ff
    );
}

.progress-text{
    margin-top:12px;

    font-size:18px;

    font-weight:bold;
}


/* STATISTICS */

.stats{
    display:grid;

    grid-template-columns:
    repeat(4,1fr);

    gap:15px;

    margin-top:25px;
}

.stat-box{
    background:#f8f6ff;

    padding:20px;

    border-radius:12px;

    text-align:center;
}

.stat-box h3{
    color:#6a3df0;

    font-size:26px;

    margin-bottom:5px;
}


/* SECTION TITLES */

.section{
    margin-top:30px;
}

.section h2{
    color:#6a3df0;

    margin-bottom:18px;
}


/* LEARNING GOALS */

.goal-card{
    background:white;

    padding:22px;

    border-radius:14px;

    box-shadow:0 3px 8px rgba(0,0,0,0.07);

    border-left:5px solid #7b4dff;
}

.goal-card h3{
    margin-bottom:8px;

    color:#6a3df0;
}


/* SKILLS */

.skill-grid{
    display:grid;

    grid-template-columns:
    repeat(4,1fr);

    gap:15px;
}

.skill-card{
    background:white;

    padding:20px;

    border-radius:12px;

    box-shadow:0 3px 8px rgba(0,0,0,0.07);
}

.skill-card h3{
    color:#6a3df0;

    margin-bottom:10px;
}

.skill-progress{
    width:100%;

    height:10px;

    background:#e5e5e5;

    border-radius:10px;

    overflow:hidden;
}

.skill-fill{
    height:100%;

    background:#7b4dff;
}


/* PRACTICE STATISTICS */

.practice-grid{
    display:grid;

    grid-template-columns:
    repeat(3,1fr);

    gap:20px;
}

.practice-card{
    background:white;

    padding:25px;

    text-align:center;

    border-radius:14px;

    box-shadow:0 3px 8px rgba(0,0,0,0.07);
}

.practice-card h3{
    color:#6a3df0;

    font-size:30px;

    margin-bottom:8px;
}


/* ASSESSMENT HISTORY */

.assessment-table{
    width:100%;

    background:white;

    border-radius:14px;

    overflow:hidden;

    box-shadow:0 3px 8px rgba(0,0,0,0.07);

    border-collapse:collapse;
}

.assessment-table th{
    background:#7b4dff;

    color:white;

    padding:15px;

    text-align:left;
}

.assessment-table td{
    padding:15px;

    border-bottom:1px solid #eee;
}

.score{
    font-weight:bold;

    color:#6a3df0;
}


/* RECENT PRACTICE */

.activity-list{
    list-style:none;
}

.activity-list li{
    background:white;

    padding:17px;

    margin-bottom:10px;

    border-radius:10px;

    box-shadow:0 2px 6px rgba(0,0,0,0.06);
}

.activity-icon{
    margin-right:10px;
}


/* RESPONSIVE */

@media(max-width:1000px){

    .profile-section{
        flex-direction:column;
    }

    .profile-card,
    .progress-card{
        width:100%;
    }

    .stats{
        grid-template-columns:
        repeat(2,1fr);
    }

    .skill-grid{
        grid-template-columns:
        repeat(2,1fr);
    }

}

@media(max-width:600px){

    .header{
        padding:18px;
    }

    .header h1{
        font-size:20px;
    }

    .container{
        width:92%;
    }

    .stats{
        grid-template-columns:1fr;
    }

    .skill-grid{
        grid-template-columns:1fr;
    }

    .practice-grid{
        grid-template-columns:1fr;
    }

}

</style>

</head>


<body>


<!-- HEADER -->

<div class="header">

    <h1>
        Sign Language Learning & Assessment
    </h1>

    <a
        href="logout.php"
        class="logout-btn">

        Logout

    </a>

</div>


<div class="container">


<!-- PROFILE + PROGRESS -->

<div class="profile-section">


    <!-- PROFILE CARD -->

    <div class="card profile-card">

        <h2>
            Learner Profile
        </h2>

        <p>
            <strong>Name:</strong>
            <?php echo htmlspecialchars($fullname); ?>
        </p>

        <p>
            <strong>Email:</strong>
            <?php echo htmlspecialchars($email); ?>
        </p>

        <div class="profile-info">

            <div class="info-item">

                <strong>
                    Learning Level
                </strong>

                <br>

                <?php echo htmlspecialchars($level); ?>

            </div>


            <div class="info-item">

                <strong>
                    Preferred Language
                </strong>

                <br>

                <?php echo $preferred_language; ?>

            </div>

        </div>


        <div class="level-badge">

            <?php echo htmlspecialchars($level); ?>

            Learner

        </div>

    </div>



    <!-- PROGRESS CARD -->

    <div class="card progress-card">

        <h2>
            Learning Progress
        </h2>

        <p>
            Overall Sign Language Learning Progress
        </p>


        <div class="progress-bar">

            <div class="progress"></div>

        </div>


        <div class="progress-text">

            <?php echo $progress; ?>% Completed

        </div>


        <!-- STATISTICS -->

        <div class="stats">


            <div class="stat-box">

                <h3>
                    <?php echo $accuracy; ?>%
                </h3>

                <p>
                    Sign Accuracy
                </p>

            </div>


            <div class="stat-box">

                <h3>
                    <?php echo $practice_sessions; ?>
                </h3>

                <p>
                    Practice Sessions
                </p>

            </div>


            <div class="stat-box">

                <h3>
                    <?php echo $assessments_completed; ?>
                </h3>

                <p>
                    Assessments
                </p>

            </div>


            <div class="stat-box">

                <h3>
                    <?php echo $skills_mastered; ?>
                </h3>

                <p>
                    Skills Mastered
                </p>

            </div>


        </div>

    </div>

</div>



<!-- LEARNING GOALS -->

<div class="section">

    <h2>
        Learning Goals
    </h2>


    <div class="goal-card">

        <h3>
            Current Learning Goal
        </h3>

        <p>
            <?php echo $learning_goal; ?>
        </p>

    </div>

</div>



<!-- SKILL TRACKING -->

<div class="section">

    <h2>
        Sign Language Skill Tracking
    </h2>


    <div class="skill-grid">


        <div class="skill-card">

            <h3>
                Hand Shape
            </h3>

            <p>
                85% Mastery
            </p>

            <br>

            <div class="skill-progress">

                <div
                    class="skill-fill"
                    style="width:85%">
                </div>

            </div>

        </div>



        <div class="skill-card">

            <h3>
                Hand Movement
            </h3>

            <p>
                78% Mastery
            </p>

            <br>

            <div class="skill-progress">

                <div
                    class="skill-fill"
                    style="width:78%">
                </div>

            </div>

        </div>



        <div class="skill-card">

            <h3>
                Sign Position
            </h3>

            <p>
                82% Mastery
            </p>

            <br>

            <div class="skill-progress">

                <div
                    class="skill-fill"
                    style="width:82%">
                </div>

            </div>

        </div>



        <div class="skill-card">

            <h3>
                Gesture Timing
            </h3>

            <p>
                74% Mastery
            </p>

            <br>

            <div class="skill-progress">

                <div
                    class="skill-fill"
                    style="width:74%">
                </div>

            </div>

        </div>


    </div>

</div>



<!-- PRACTICE STATISTICS -->

<div class="section">

    <h2>
        Practice Statistics
    </h2>


    <div class="practice-grid">


        <div class="practice-card">

            <h3>
                18
            </h3>

            <p>
                Total Practice Sessions
            </p>

        </div>


        <div class="practice-card">

            <h3>
                72 min
            </h3>

            <p>
                Practice Time
            </p>

        </div>


        <div class="practice-card">

            <h3>
                82%
            </h3>

            <p>
                Average Sign Accuracy
            </p>

        </div>


    </div>

</div>



<!-- ASSESSMENT HISTORY -->

<div class="section">

    <h2>
        Assessment History
    </h2>


    <table class="assessment-table">

        <tr>

            <th>
                Assessment
            </th>

            <th>
                Skill
            </th>

            <th>
                Accuracy
            </th>

            <th>
                Status
            </th>

        </tr>


        <tr>

            <td>
                Basic Signs Assessment
            </td>

            <td>
                Hand Shape
            </td>

            <td class="score">
                86%
            </td>

            <td>
                Completed
            </td>

        </tr>


        <tr>

            <td>
                Everyday Communication
            </td>

            <td>
                Gesture Movement
            </td>

            <td class="score">
                81%
            </td>

            <td>
                Completed
            </td>

        </tr>


        <tr>

            <td>
                Sign Position Assessment
            </td>

            <td>
                Position Accuracy
            </td>

            <td class="score">
                79%
            </td>

            <td>
                Completed
            </td>

        </tr>


    </table>

</div>



<!-- RECENT PRACTICE HISTORY -->

<div class="section">

    <h2>
        Recent Practice History
    </h2>


    <ul class="activity-list">


        <li>

            <span class="activity-icon">
                🤟
            </span>

            Practiced basic sign language gestures

        </li>


        <li>

            <span class="activity-icon">
                🎯
            </span>

            Completed hand shape accuracy assessment

        </li>


        <li>

            <span class="activity-icon">
                📊
            </span>

            Achieved 82% average sign accuracy

        </li>


        <li>

            <span class="activity-icon">
                🤖
            </span>

            Received AI feedback on gesture movement

        </li>


        <li>

            <span class="activity-icon">
                📈
            </span>

            Learning progress updated to
            <?php echo $progress; ?>%

        </li>


    </ul>

</div>


</div>

</body>

</html>