<?php
session_start();

if(!isset($_SESSION['email']))
{
    header("Location:index.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Learner Profile Dashboard</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial,sans-serif;
}

body{
    background:#f5f3ff;
}

.header{
    background:#7b4dff;
    color:white;
    padding:20px 40px;
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.header h1{
    font-size:28px;
}

.logout-btn{
    background:white;
    color:#7b4dff;
    padding:10px 20px;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
}

.container{
    width:95%;
    margin:30px auto;
}

.profile-section{
    display:flex;
    gap:20px;
    margin-bottom:25px;
}

.card{
    background:white;
    border-radius:15px;
    padding:25px;
    box-shadow:0 4px 10px rgba(0,0,0,0.1);
}

.profile-card{
    width:35%;
}

.profile-card h2{
    color:#7b4dff;
    margin-bottom:15px;
}

.profile-card p{
    margin-bottom:10px;
}

.badge{
    display:inline-block;
    background:#7b4dff;
    color:white;
    padding:8px 15px;
    border-radius:20px;
    margin-top:10px;
}

.progress-card{
    width:65%;
}

.progress-card h2{
    color:#7b4dff;
    margin-bottom:15px;
}

.progress-bar{
    width:100%;
    height:25px;
    background:#e5e5e5;
    border-radius:20px;
    overflow:hidden;
}

.progress{
    width:65%;
    height:100%;
    background:#7b4dff;
}

.stats{
    display:flex;
    gap:20px;
    margin-top:20px;
}

.stat-box{
    flex:1;
    background:#f8f6ff;
    padding:20px;
    border-radius:10px;
    text-align:center;
}

.stat-box h3{
    color:#7b4dff;
}

.activities{
    margin-top:25px;
}

.activities h2{
    color:#7b4dff;
    margin-bottom:15px;
}

.activities ul{
    list-style:none;
}

.activities li{
    background:white;
    margin-bottom:10px;
    padding:15px;
    border-radius:10px;
    box-shadow:0 2px 5px rgba(0,0,0,0.05);
}

.courses{
    margin-top:25px;
}

.courses h2{
    color:#7b4dff;
    margin-bottom:15px;
}

.course-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:15px;
}

.course-card{
    background:white;
    padding:20px;
    border-radius:12px;
    text-align:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.08);
}

.course-card h4{
    color:#7b4dff;
}

@media(max-width:900px){

.profile-section{
    flex-direction:column;
}

.profile-card,
.progress-card{
    width:100%;
}

.course-grid{
    grid-template-columns:repeat(2,1fr);
}
}

</style>
</head>

<body>

<div class="header">
    <h1>Learner Profile Dashboard</h1>

    <a href="logout.php" class="logout-btn">
        Logout
    </a>
</div>

<div class="container">

    <div class="profile-section">

        <div class="card profile-card">

            <h2>Profile</h2>

            <p><strong>Name:</strong>
            <?php echo $_SESSION['fullname']; ?></p>

            <p><strong>Email:</strong>
            <?php echo $_SESSION['email']; ?></p>

            <p><strong>Level:</strong>
            <?php echo $_SESSION['course']; ?></p>

            <div class="badge">
                <?php echo $_SESSION['course']; ?>
            </div>

        </div>

        <div class="card progress-card">

            <h2>Learning Progress</h2>

            <div class="progress-bar">
                <div class="progress"></div>
            </div>

            <br>

            <h3>65% Completed</h3>

            <div class="stats">

                <div class="stat-box">
                    <h3>4</h3>
                    <p>Courses</p>
                </div>

                <div class="stat-box">
                    <h3>2</h3>
                    <p>Certificates</p>
                </div>

                <div class="stat-box">
                    <h3>12</h3>
                    <p>Activities</p>
                </div>

            </div>

        </div>

    </div>

    <div class="courses">

        <h2>Courses Enrolled</h2>

        <div class="course-grid">

            <div class="course-card">
                <h4>HTML & CSS</h4>
                <p>Completed</p>
            </div>

            <div class="course-card">
                <h4>JavaScript</h4>
                <p>In Progress</p>
            </div>

            <div class="course-card">
                <h4>PHP Basics</h4>
                <p>In Progress</p>
            </div>

            <div class="course-card">
                <h4>MySQL</h4>
                <p>Completed</p>
            </div>

        </div>

    </div>

    <div class="activities">

        <h2>Recent Activities</h2>

        <ul>

            <li>✅ Completed HTML Fundamentals Quiz</li>

            <li>✅ Earned HTML Certificate</li>

            <li>📘 Started PHP Basics Course</li>

            <li>📝 Updated Learner Profile</li>

            <li>🎯 Reached 65% Learning Progress</li>

        </ul>

    </div>

</div>

</body>
</html>