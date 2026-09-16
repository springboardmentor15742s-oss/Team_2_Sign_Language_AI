from app.database.database import SessionLocal
from app.models.course import Course, Category, LevelEnum
from app.models.lesson import Lesson


COURSES = [
    {
        "title": "ASL Foundations",
        "slug": "asl-foundations",
        "description": (
            "Build a strong foundation in American Sign Language with "
            "alphabet recognition, hand shapes, orientation, and basic signing."
        ),
        "level": LevelEnum.beginner,
        "category": {
            "name": "Foundations",
            "slug": "foundations",
            "description": "Core ASL skills and alphabet fundamentals.",
        },
        "duration_minutes": 70,
        "rating": 4.8,
        "thumbnail_url": None,
        "is_published": True,
        "lessons": [
            {
                "title": "Introduction to ASL",
                "description": (
                    "Learn what ASL is, how visual communication works, "
                    "and the basic principles of clear signing."
                ),
                "content": (
                    "This lesson introduces American Sign Language, "
                    "visual attention, hand shape, orientation, movement, "
                    "and clear signing habits."
                ),
                "order_index": 1,
                "duration_minutes": 8,
                "is_published": True,
            },
            {
                "title": "Alphabet A–F",
                "description": (
                    "Learn and practice the first six ASL alphabet signs "
                    "with correct hand shape and orientation."
                ),
                "content": (
                    "Practice A, B, C, D, E, and F. Focus on finger placement, "
                    "palm orientation, and keeping the hand steady."
                ),
                "order_index": 2,
                "duration_minutes": 12,
                "is_published": True,
            },
            {
                "title": "Alphabet G–L",
                "description": (
                    "Continue alphabet training with signs G through L "
                    "and practice recognition accuracy."
                ),
                "content": (
                    "Practice G, H, I, J, K, and L with attention to "
                    "movement-based signs and finger orientation."
                ),
                "order_index": 3,
                "duration_minutes": 12,
                "is_published": True,
            },
            {
                "title": "Alphabet M–R",
                "description": (
                    "Practice M through R, focusing on subtle finger-position "
                    "differences between visually similar signs."
                ),
                "content": (
                    "Practice M, N, O, P, Q, and R. Pay close attention to "
                    "similar signs and small differences in finger placement."
                ),
                "order_index": 4,
                "duration_minutes": 14,
                "is_published": True,
            },
            {
                "title": "Alphabet S–Z",
                "description": (
                    "Complete the ASL alphabet and practice the final set "
                    "of static and movement-based signs."
                ),
                "content": (
                    "Practice S, T, U, V, W, X, Y, and Z. Focus especially on "
                    "U, V, and W because they can look visually similar."
                ),
                "order_index": 5,
                "duration_minutes": 14,
                "is_published": True,
            },
            {
                "title": "Alphabet Recognition Challenge",
                "description": (
                    "Test your recognition skills and use SignSpeak AI "
                    "to identify weak and strong alphabet signs."
                ),
                "content": (
                    "Complete a mixed-sign recognition challenge and then "
                    "review AI feedback and recommendations."
                ),
                "order_index": 6,
                "duration_minutes": 10,
                "is_published": True,
            },
        ],
    },

    {
        "title": "Numbers & Everyday Signs",
        "slug": "numbers-everyday-signs",
        "description": (
            "Learn numbers, greetings, polite expressions, and common signs "
            "used in everyday communication."
        ),
        "level": LevelEnum.beginner,
        "category": {
            "name": "Daily Communication",
            "slug": "daily-communication",
            "description": "Practical signs for everyday situations.",
        },
        "duration_minutes": 56,
        "rating": 4.7,
        "thumbnail_url": None,
        "is_published": True,
        "lessons": [
            {
                "title": "Numbers 1–10",
                "description": (
                    "Learn number signs from 1 to 10 and practice "
                    "clear palm orientation."
                ),
                "content": (
                    "Practice numbers 1 through 10 slowly, then repeat them "
                    "in random order."
                ),
                "order_index": 1,
                "duration_minutes": 10,
                "is_published": True,
            },
            {
                "title": "Greetings & Introductions",
                "description": (
                    "Learn signs for hello, goodbye, name, meet, and "
                    "basic introductions."
                ),
                "content": (
                    "Practice simple introductions and greetings used in "
                    "everyday ASL conversations."
                ),
                "order_index": 2,
                "duration_minutes": 12,
                "is_published": True,
            },
            {
                "title": "Please, Thank You & Sorry",
                "description": (
                    "Practice useful polite expressions for everyday communication."
                ),
                "content": (
                    "Learn polite expressions and practice using them in "
                    "short conversational examples."
                ),
                "order_index": 3,
                "duration_minutes": 10,
                "is_published": True,
            },
            {
                "title": "Family & People",
                "description": (
                    "Learn common signs for family members and people."
                ),
                "content": (
                    "Practice signs for common family relationships and people."
                ),
                "order_index": 4,
                "duration_minutes": 14,
                "is_published": True,
            },
            {
                "title": "Daily Sign Challenge",
                "description": (
                    "Combine numbers and everyday signs in a short recognition challenge."
                ),
                "content": (
                    "Complete a mixed recognition challenge using signs "
                    "from this course."
                ),
                "order_index": 5,
                "duration_minutes": 10,
                "is_published": True,
            },
        ],
    },

    {
        "title": "Conversational ASL",
        "slug": "conversational-asl",
        "description": (
            "Move beyond isolated signs and develop practical conversational "
            "skills using common phrases and question patterns."
        ),
        "level": LevelEnum.intermediate,
        "category": {
            "name": "Conversation",
            "slug": "conversation",
            "description": "Build practical conversational ASL skills.",
        },
        "duration_minutes": 66,
        "rating": 4.9,
        "thumbnail_url": None,
        "is_published": True,
        "lessons": [
            {
                "title": "Basic Question Signs",
                "description": (
                    "Learn signs used in who, what, where, when, and why questions."
                ),
                "content": (
                    "Practice common question words and learn how they are "
                    "used naturally in ASL."
                ),
                "order_index": 1,
                "duration_minutes": 14,
                "is_published": True,
            },
            {
                "title": "Daily Routines",
                "description": (
                    "Practice signs related to school, work, food, travel, and daily activities."
                ),
                "content": (
                    "Build a practical vocabulary around common daily activities."
                ),
                "order_index": 2,
                "duration_minutes": 16,
                "is_published": True,
            },
            {
                "title": "Building Short Phrases",
                "description": (
                    "Combine signs into short natural ASL phrases."
                ),
                "content": (
                    "Practice combining individual signs into meaningful "
                    "short phrases."
                ),
                "order_index": 3,
                "duration_minutes": 18,
                "is_published": True,
            },
            {
                "title": "Conversation Practice",
                "description": (
                    "Use guided prompts to practice conversational signing."
                ),
                "content": (
                    "Use short prompts to practice expressive and receptive "
                    "ASL communication."
                ),
                "order_index": 4,
                "duration_minutes": 18,
                "is_published": True,
            },
        ],
    },
]


def get_or_create_category(db, category_data):
    category = (
        db.query(Category)
        .filter(Category.slug == category_data["slug"])
        .first()
    )

    if category:
        return category

    category = Category(**category_data)
    db.add(category)
    db.flush()

    print(f"Created category: {category.name}")

    return category


def main():
    db = SessionLocal()

    try:
        for course_entry in COURSES:
            course_data = course_entry.copy()

            lessons_data = course_data.pop("lessons")
            category_data = course_data.pop("category")

            existing_course = (
                db.query(Course)
                .filter(Course.slug == course_data["slug"])
                .first()
            )

            if existing_course:
                print(f"Skipping existing course: {existing_course.title}")
                continue

            category = get_or_create_category(
                db,
                category_data,
            )

            course = Course(
                **course_data,
                category_id=category.id,
            )

            db.add(course)
            db.flush()

            print(f"Created course: {course.title}")

            for lesson_data in lessons_data:
                lesson = Lesson(
                    course_id=course.id,
                    **lesson_data,
                )

                db.add(lesson)

        db.commit()

        print("\n" + "=" * 60)
        print("SIGNSPEAK LEARNING CONTENT SEEDED")
        print("=" * 60)

        print("Categories:", db.query(Category).count())
        print("Courses:", db.query(Course).count())
        print("Lessons:", db.query(Lesson).count())

        print("=" * 60)
        print("Seed completed successfully ✅")

    except Exception as exc:
        db.rollback()

        print("\nSeed failed ❌")
        print(exc)

        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()