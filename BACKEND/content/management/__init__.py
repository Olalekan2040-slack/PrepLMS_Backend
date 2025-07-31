from django.core.management.base import BaseCommand
from content.models import EducationLevel, ClassLevel, Subject, VideoLesson


class Command(BaseCommand):
    help = 'Add sample video content for testing'

    def handle(self, *args, **options):
        # Create Education Levels
        primary, _ = EducationLevel.objects.get_or_create(
            name='Primary', 
            defaults={'description': 'Primary Education (1-6)', 'order': 1}
        )
        jss, _ = EducationLevel.objects.get_or_create(
            name='Junior Secondary School (JSS)', 
            defaults={'description': 'Junior Secondary School (1-3)', 'order': 2}
        )
        sss, _ = EducationLevel.objects.get_or_create(
            name='Senior Secondary School (SSS)', 
            defaults={'description': 'Senior Secondary School (1-3)', 'order': 3}
        )

        # Create Class Levels
        class_levels_data = [
            # Primary
            ('Primary 1', primary, 1), ('Primary 2', primary, 2), ('Primary 3', primary, 3),
            ('Primary 4', primary, 4), ('Primary 5', primary, 5), ('Primary 6', primary, 6),
            # JSS
            ('JSS 1', jss, 1), ('JSS 2', jss, 2), ('JSS 3', jss, 3),
            # SSS
            ('SSS 1', sss, 1), ('SSS 2', sss, 2), ('SSS 3', sss, 3),
        ]

        class_levels = {}
        for name, education_level, order in class_levels_data:
            class_level, _ = ClassLevel.objects.get_or_create(
                name=name,
                defaults={'education_level': education_level, 'order': order}
            )
            class_levels[name] = class_level

        # Create Subjects
        subjects_data = [
            ('Mathematics', 'Learn mathematical concepts and problem solving'),
            ('English Language', 'Master reading, writing, and communication skills'),
            ('Science', 'Explore the natural world through scientific inquiry'),
            ('Biology', 'Study living organisms and life processes'),
            ('Chemistry', 'Understand matter, its properties and interactions'),
            ('Physics', 'Learn about matter, energy, and their interactions'),
            ('Geography', 'Study the Earth and its features'),
            ('History', 'Learn about past events and civilizations'),
            ('Economics', 'Understand how societies allocate resources'),
            ('Literature', 'Explore written works and literary analysis'),
        ]

        subjects = {}
        for name, description in subjects_data:
            subject, _ = Subject.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            subjects[name] = subject

        # Sample YouTube video data (using educational videos)
        sample_videos = [
            # Mathematics
            {
                'title': 'Introduction to Basic Addition',
                'description': 'Learn the fundamentals of addition with simple examples and practice problems.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',  # Replace with actual educational video IDs
                'is_free': True,
                'duration': 600,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Basic Subtraction Methods',
                'description': 'Master subtraction techniques with step-by-step explanations.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': True,
                'duration': 480,
                'processing_status': 'ready',
                'order_in_subject': 2
            },
            {
                'title': 'Multiplication Tables 1-5',
                'description': 'Learn and memorize multiplication tables from 1 to 5.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['Primary 2'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 720,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # English Language
            {
                'title': 'Alphabet Recognition and Sounds',
                'description': 'Learn to recognize letters and their corresponding sounds.',
                'subject': subjects['English Language'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': True,
                'duration': 540,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Basic Sentence Formation',
                'description': 'Learn how to form simple sentences with subjects and verbs.',
                'subject': subjects['English Language'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': True,
                'duration': 420,
                'processing_status': 'ready',
                'order_in_subject': 2
            },
            {
                'title': 'Reading Comprehension Basics',
                'description': 'Develop reading skills and understand simple texts.',
                'subject': subjects['English Language'],
                'class_level': class_levels['Primary 2'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 660,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Science
            {
                'title': 'Living and Non-Living Things',
                'description': 'Learn to distinguish between living and non-living things.',
                'subject': subjects['Science'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': True,
                'duration': 480,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'The Human Body - Basic Parts',
                'description': 'Identify and learn about basic parts of the human body.',
                'subject': subjects['Science'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': True,
                'duration': 600,
                'processing_status': 'ready',
                'order_in_subject': 2
            },
            {
                'title': 'Plants and Their Parts',
                'description': 'Learn about different parts of plants and their functions.',
                'subject': subjects['Science'],
                'class_level': class_levels['Primary 2'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 540,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # JSS Level content
            {
                'title': 'Introduction to Algebra',
                'description': 'Learn the basics of algebra and solving simple equations.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['JSS 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 900,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Parts of Speech',
                'description': 'Understand nouns, verbs, adjectives, and other parts of speech.',
                'subject': subjects['English Language'],
                'class_level': class_levels['JSS 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 780,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Cell Structure and Function',
                'description': 'Explore the basic structure and function of plant and animal cells.',
                'subject': subjects['Biology'],
                'class_level': class_levels['JSS 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 1020,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # SSS Level content
            {
                'title': 'Quadratic Equations',
                'description': 'Master solving quadratic equations using various methods.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 1200,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Chemical Bonding',
                'description': 'Understand ionic and covalent bonding in chemistry.',
                'subject': subjects['Chemistry'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 1080,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Newton\'s Laws of Motion',
                'description': 'Learn about the three fundamental laws of motion.',
                'subject': subjects['Physics'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'dQw4w9WgXcQ',
                'is_free': False,
                'duration': 960,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
        ]

        # Create video lessons
        created_count = 0
        for video_data in sample_videos:
            video, created = VideoLesson.objects.get_or_create(
                title=video_data['title'],
                subject=video_data['subject'],
                class_level=video_data['class_level'],
                defaults=video_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created video: {video.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} new videos. '
                f'Total videos in database: {VideoLesson.objects.count()}'
            )
        )
