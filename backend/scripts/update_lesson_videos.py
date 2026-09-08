from app.database.database import SessionLocal
from app.models.lesson import Lesson


VIDEO_MAP = {
    "Introduction to Sign Language":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Alphabet and Fingerspelling":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Numbers and Counting":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Greetings and Introductions":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Everyday Starter Vocabulary":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Daily Greetings":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Family and People":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Food and Shopping":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Time, Days and Routines":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Short Everyday Conversations":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Sentence Building":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Questions and Responses":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Descriptions and Directions":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Conversation Strategies":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Intermediate Conversation Practice":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Classroom Vocabulary":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Subjects and Study":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Instructions and Questions":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Academic Conversations":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Educational Scenario Practice":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Advanced Sentence Structures":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Nuance and Expression":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Storytelling and Sequencing":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Complex Conversation Practice":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Advanced Fluency Challenge":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Workplace Introductions":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Meetings and Discussions":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Requests and Clarification":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Workplace Scenarios":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",

    "Professional Communication Challenge":
        "https://www.youtube.com/watch?v=DBQINq0SsAw",
}


def update_videos():
    db = SessionLocal()

    try:
        updated = 0
        missing = []

        for title, video_url in VIDEO_MAP.items():
            lesson = (
                db.query(Lesson)
                .filter(Lesson.title == title)
                .first()
            )

            if not lesson:
                missing.append(title)
                continue

            lesson.video_url = video_url
            updated += 1

        db.commit()

        print("Video update complete.")
        print("Updated lessons:", updated)

        if missing:
            print("Missing lessons:")
            for title in missing:
                print("-", title)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    update_videos()
