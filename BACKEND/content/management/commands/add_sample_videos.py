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

        # Sample YouTube video data (using real educational videos)
        sample_videos = [
            # Physics
            {
                'title': 'Basic Introduction to Physics',
                'description': 'Comprehensive introduction to physics concepts and fundamentals.',
                'subject': subjects['Physics'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'b1t41Q3xRM8',
                'is_free': True,
                'duration': 1800,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Chemistry
            {
                'title': 'Introduction to Chemistry – Online Chemistry Course',
                'description': 'Complete introduction to chemistry for beginners and advanced learners.',
                'subject': subjects['Chemistry'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'k3rRrl9J2F4',
                'is_free': True,
                'duration': 2400,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Biology
            {
                'title': 'Reproduction in Organisms (Senior Secondary)',
                'description': 'Learn about reproduction processes in living organisms.',
                'subject': subjects['Biology'],
                'class_level': class_levels['SSS 2'],
                'video_source': 'youtube',
                'video_id': 'fNlb4GiO8cI',
                'is_free': True,
                'duration': 1200,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Mathematics - Algebra
            {
                'title': 'Master Algebra – High School and Advanced Mathematics',
                'description': 'Comprehensive algebra course for high school and advanced students.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'wMMGCrMe7tQ',
                'is_free': False,
                'duration': 3600,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Mathematics - Basic concepts for Primary
            {
                'title': 'Introduction to Numbers and Counting',
                'description': 'Learn basic number recognition and counting skills.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['Primary 1'],
                'video_source': 'youtube',
                'video_id': 'wMMGCrMe7tQ',  # Using same video but for different level
                'is_free': True,
                'duration': 600,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Basic Addition and Subtraction',
                'description': 'Master fundamental arithmetic operations.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['Primary 2'],
                'video_source': 'youtube',
                'video_id': 'wMMGCrMe7tQ',
                'is_free': True,
                'duration': 720,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # English Language
            {
                'title': 'English Grammar Fundamentals',
                'description': 'Learn essential English grammar rules and structures.',
                'subject': subjects['English Language'],
                'class_level': class_levels['JSS 1'],
                'video_source': 'youtube',
                'video_id': 'b1t41Q3xRM8',  # Using physics video as placeholder
                'is_free': True,
                'duration': 900,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Reading and Comprehension Skills',
                'description': 'Develop advanced reading and comprehension abilities.',
                'subject': subjects['English Language'],
                'class_level': class_levels['Primary 3'],
                'video_source': 'youtube',
                'video_id': 'b1t41Q3xRM8',
                'is_free': True,
                'duration': 780,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Science - General concepts
            {
                'title': 'Introduction to Scientific Method',
                'description': 'Learn the basics of scientific inquiry and experimentation.',
                'subject': subjects['Science'],
                'class_level': class_levels['JSS 1'],
                'video_source': 'youtube',
                'video_id': 'k3rRrl9J2F4',  # Using chemistry video
                'is_free': True,
                'duration': 1080,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            {
                'title': 'Matter and Its Properties',
                'description': 'Explore different states of matter and their characteristics.',
                'subject': subjects['Science'],
                'class_level': class_levels['Primary 4'],
                'video_source': 'youtube',
                'video_id': 'k3rRrl9J2F4',
                'is_free': True,
                'duration': 660,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Advanced Mathematics
            {
                'title': 'Quadratic Equations and Functions',
                'description': 'Master solving quadratic equations using various methods.',
                'subject': subjects['Mathematics'],
                'class_level': class_levels['SSS 2'],
                'video_source': 'youtube',
                'video_id': 'wMMGCrMe7tQ',
                'is_free': False,
                'duration': 1200,
                'processing_status': 'ready',
                'order_in_subject': 2
            },
            # Advanced Biology
            {
                'title': 'Cell Biology and Genetics',
                'description': 'Explore cellular structures and genetic principles.',
                'subject': subjects['Biology'],
                'class_level': class_levels['SSS 1'],
                'video_source': 'youtube',
                'video_id': 'fNlb4GiO8cI',
                'is_free': False,
                'duration': 1440,
                'processing_status': 'ready',
                'order_in_subject': 1
            },
            # Advanced Chemistry
            {
                'title': 'Chemical Reactions and Bonding',
                'description': 'Understand chemical reactions and molecular bonding.',
                'subject': subjects['Chemistry'],
                'class_level': class_levels['SSS 2'],
                'video_source': 'youtube',
                'video_id': 'k3rRrl9J2F4',
                'is_free': False,
                'duration': 1320,
                'processing_status': 'ready',
                'order_in_subject': 2
            },
            # Advanced Physics
            {
                'title': 'Newton\'s Laws and Motion',
                'description': 'Learn about the fundamental laws governing motion and forces.',
                'subject': subjects['Physics'],
                'class_level': class_levels['SSS 2'],
                'video_source': 'youtube',
                'video_id': 'b1t41Q3xRM8',
                'is_free': False,
                'duration': 1500,
                'processing_status': 'ready',
                'order_in_subject': 2
            },
            # Literature
            {
                'title': 'Introduction to Literature Analysis',
                'description': 'Learn to analyze and appreciate literary works.',
                'subject': subjects['Literature'],
                'class_level': class_levels['JSS 2'],
                'video_source': 'youtube',
                'video_id': 'b1t41Q3xRM8',  # Using as placeholder
                'is_free': True,
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
