"""Seed the SignSpeak learning catalogue from the project specification.

Run from the backend directory after PostgreSQL is configured and migrations
have completed:
    python scripts/seed_courses.py

The script is idempotent: existing categories/courses/lessons are reused and
missing records are created. It does not delete user data or enrollments.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.course import Category, Course, LevelEnum
from app.models.lesson import Lesson


CATALOG = [
    {
        "category": "Beginner Sign Language",
        "category_slug": "beginner-sign-language",
        "category_description": "Foundational signs, alphabet, numbers and simple expressions.",
        "title": "Sign Language Fundamentals",
        "slug": "sign-language-fundamentals",
        "level": LevelEnum.beginner,
        "description": "Build a strong foundation in sign language through alphabet, numbers, greetings and everyday expressions.",
        "duration": 120,
        "art": "/course-art/alphabet.svg",
        "lessons": [
            ("Introduction to Sign Language", "Understand the basics, communication etiquette and learning approach.", 15),
            ("Alphabet and Fingerspelling", "Learn the manual alphabet and practice fingerspelling common words.", 25),
            ("Numbers and Counting", "Practice numbers, age, dates and simple counting signs.", 20),
            ("Greetings and Introductions", "Learn hello, goodbye, please, thank you and basic introductions.", 25),
            ("Everyday Starter Vocabulary", "Build a starter vocabulary for common people, objects and actions.", 35),
        ],
    },
    {
        "category": "Everyday Communication",
        "category_slug": "everyday-communication",
        "category_description": "Practical communication for daily conversations and common situations.",
        "title": "Everyday Signs & Greetings",
        "slug": "everyday-signs-and-greetings",
        "level": LevelEnum.beginner,
        "description": "Practice practical signs and short conversations used in everyday communication.",
        "duration": 135,
        "art": "/course-art/conversation.svg",
        "lessons": [
            ("Daily Greetings", "Practice greetings, introductions and polite expressions.", 20),
            ("Family and People", "Describe family members, friends and people around you.", 25),
            ("Food and Shopping", "Use signs for food, drinks, prices and simple shopping requests.", 30),
            ("Time, Days and Routines", "Talk about time, days, schedules and everyday routines.", 25),
            ("Short Everyday Conversations", "Combine vocabulary into short practical conversations.", 35),
        ],
    },
    {
        "category": "Intermediate Sign Language",
        "category_slug": "intermediate-sign-language",
        "category_description": "Expanded vocabulary, sentence structure and conversational fluency.",
        "title": "Intermediate Sign Language Communication",
        "slug": "intermediate-sign-language-communication",
        "level": LevelEnum.intermediate,
        "description": "Move beyond individual signs and build clearer, longer conversations with improved fluency.",
        "duration": 180,
        "art": "/course-art/vocabulary.svg",
        "lessons": [
            ("Sentence Building", "Combine signs into meaningful phrases and sentences.", 30),
            ("Questions and Responses", "Practice asking, understanding and answering common questions.", 30),
            ("Descriptions and Directions", "Describe people, places and routes using structured signing.", 35),
            ("Conversation Strategies", "Practice turn-taking, clarification and conversational repair.", 40),
            ("Intermediate Conversation Practice", "Apply vocabulary and sentence structures in guided scenarios.", 45),
        ],
    },
    {
        "category": "Educational Vocabulary",
        "category_slug": "educational-vocabulary",
        "category_description": "Vocabulary and communication used in learning and educational environments.",
        "title": "Educational Sign Language Vocabulary",
        "slug": "educational-sign-language-vocabulary",
        "level": LevelEnum.intermediate,
        "description": "Learn signs and phrases useful in classrooms, study environments and educational conversations.",
        "duration": 150,
        "art": "/course-art/vocabulary.svg",
        "lessons": [
            ("Classroom Vocabulary", "Learn common classroom objects, people and actions.", 25),
            ("Subjects and Study", "Practice vocabulary for subjects, assignments, exams and study activities.", 30),
            ("Instructions and Questions", "Understand and express classroom instructions and questions.", 30),
            ("Academic Conversations", "Build short conversations around learning topics and classroom situations.", 30),
            ("Educational Scenario Practice", "Apply educational vocabulary in realistic guided scenarios.", 35),
        ],
    },
    {
        "category": "Advanced Sign Language",
        "category_slug": "advanced-sign-language",
        "category_description": "Advanced fluency, nuanced expression and complex conversational situations.",
        "title": "Advanced Sign Language Communication",
        "slug": "advanced-sign-language-communication",
        "level": LevelEnum.advanced,
        "description": "Develop advanced fluency through complex conversations, nuanced expression and longer signed interactions.",
        "duration": 210,
        "art": "/course-art/advanced.svg",
        "lessons": [
            ("Advanced Sentence Structures", "Work with longer and more complex signed statements.", 35),
            ("Nuance and Expression", "Practice emphasis, emotion and contextual meaning.", 40),
            ("Storytelling and Sequencing", "Build coherent narratives using sequencing and descriptive signing.", 45),
            ("Complex Conversation Practice", "Handle longer conversations and unexpected questions.", 45),
            ("Advanced Fluency Challenge", "Apply advanced skills in a structured performance task.", 45),
        ],
    },
    {
        "category": "Professional Communication",
        "category_slug": "professional-communication",
        "category_description": "Professional vocabulary and communication for workplace situations.",
        "title": "Professional Sign Language Communication",
        "slug": "professional-sign-language-communication",
        "level": LevelEnum.advanced,
        "description": "Build workplace-ready communication skills for meetings, introductions, collaboration and professional scenarios.",
        "duration": 180,
        "art": "/course-art/advanced.svg",
        "lessons": [
            ("Workplace Introductions", "Practice professional introductions, roles and responsibilities.", 30),
            ("Meetings and Discussions", "Learn vocabulary for meetings, discussions and decision-making.", 35),
            ("Requests and Clarification", "Communicate requests, questions and clarification professionally.", 35),
            ("Workplace Scenarios", "Practice common workplace interactions through guided scenarios.", 40),
            ("Professional Communication Challenge", "Apply professional vocabulary in an end-to-end practice scenario.", 40),
        ],
    },
]


def get_or_create_category(db: Session, item: dict) -> Category:
    category = db.query(Category).filter(Category.slug == item["category_slug"]).first()
    if category:
        category.name = item["category"]
        category.description = item["category_description"]
        return category
    category = Category(
        name=item["category"],
        slug=item["category_slug"],
        description=item["category_description"],
    )
    db.add(category)
    db.flush()
    return category


def seed() -> None:
    db = SessionLocal()
    created_courses = 0
    created_lessons = 0
    try:
        for item in CATALOG:
            category = get_or_create_category(db, item)
            course = db.query(Course).filter(Course.slug == item["slug"]).first()
            if not course:
                course = Course(
                    title=item["title"],
                    slug=item["slug"],
                    description=item["description"],
                    thumbnail_url=item["art"],
                    level=item["level"],
                    category_id=category.id,
                    duration_minutes=item["duration"],
                    rating=0.0,
                    is_published=True,
                )
                db.add(course)
                db.flush()
                created_courses += 1
            else:
                course.title = item["title"]
                course.description = item["description"]
                course.thumbnail_url = item["art"]
                course.level = item["level"]
                course.category_id = category.id
                course.duration_minutes = item["duration"]
                course.is_published = True

            existing_titles = {l.title for l in course.lessons}
            for index, (title, description, minutes) in enumerate(item["lessons"], start=1):
                if title in existing_titles:
                    continue
                db.add(Lesson(
                    course_id=course.id,
                    title=title,
                    description=description,
                    content=description,
                    order_index=index,
                    duration_minutes=minutes,
                    is_published=True,
                ))
                created_lessons += 1

        db.commit()
        total_courses = db.query(Course).count()
        total_lessons = db.query(Lesson).count()
        print(f"Seed complete. Created {created_courses} courses and {created_lessons} lessons.")
        print(f"Catalogue totals: {total_courses} courses, {total_lessons} lessons.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
