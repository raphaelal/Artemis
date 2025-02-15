package de.tum.in.www1.artemis.domain.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tum.in.www1.artemis.config.Constants;
import de.tum.in.www1.artemis.domain.*;
import de.tum.in.www1.artemis.domain.enumeration.GroupNotificationType;
import de.tum.in.www1.artemis.domain.enumeration.NotificationPriority;
import de.tum.in.www1.artemis.domain.enumeration.NotificationType;
import de.tum.in.www1.artemis.domain.exam.Exam;
import de.tum.in.www1.artemis.domain.metis.AnswerPost;
import de.tum.in.www1.artemis.domain.metis.Post;

public class GroupNotificationFactoryTest {

    @Mock
    private User user;

    @Mock
    private GroupNotificationType groupNotificationType;

    @Mock
    private static GroupNotificationFactory groupNotificationFactory;

    @Mock
    private static Lecture lecture;

    private static Long lectureId = 0L;

    @Mock
    private static Course course;

    private static Long courseId = 1L;

    @Mock
    private static Exam exam;

    private static Long examId = 27L;

    @Mock
    private static Attachment attachment;

    @Mock
    private static Exercise exercise;

    private static Long exerciseId = 42L;

    @Mock
    private static Post post;

    @Mock
    private static AnswerPost answerPost;

    private String expectedTitle;

    private String expectedText;

    private String expectedTarget;

    private NotificationPriority expectedPriority;

    private GroupNotification createdNotification;

    private NotificationType notificationType;

    private String notificationText = "notification text";

    private static List<String> archiveErrors = new ArrayList();

    /**
     * sets up all needed mocks and their wanted behavior once for all test cases.
     */
    @BeforeAll
    public static void setUp() {
        groupNotificationFactory = mock(GroupNotificationFactory.class, CALLS_REAL_METHODS);

        course = mock(Course.class);
        when(course.getId()).thenReturn(courseId);

        lecture = mock(Lecture.class);
        when(lecture.getId()).thenReturn(lectureId);
        when(lecture.getCourse()).thenReturn(course);

        exam = mock(Exam.class);
        when(exam.getId()).thenReturn(examId);
        when(exam.getCourse()).thenReturn(course);

        exercise = mock(Exercise.class);
        when(exercise.getId()).thenReturn(exerciseId);
        when(exercise.getTitle()).thenReturn("exercise title");
        when(exercise.getCourseViaExerciseGroupOrCourseMember()).thenReturn(course);
        when(exercise.getExamViaExerciseGroupOrCourseMember()).thenReturn(exam);
        when(exercise.getProblemStatement()).thenReturn("problem statement");

        attachment = mock(Attachment.class);
        when(attachment.getLecture()).thenReturn(lecture);

        post = mock(Post.class);
        when(post.getExercise()).thenReturn(exercise);
        when(post.getLecture()).thenReturn(lecture);

        answerPost = mock(AnswerPost.class);
        when(answerPost.getPost()).thenReturn(post);
    }

    /**
     * Shared collection of assertions that check if the created notification is correct
     * @param createdNotification is the notification that should be checked for correctness.
     * @param expectedTitle is the expected title that the notification should have.
     * @param expectedText is the expected text that the notification should have.
     * @param expectedTarget is the expected target that the notification should have.
     * @param expectedPriority is the expected priority that the notification should have.
     */
    private void checkCreatedNotification(GroupNotification createdNotification, String expectedTitle, String expectedText, String expectedTarget,
            NotificationPriority expectedPriority) {
        assertThat(createdNotification.getTitle()).isEqualTo(expectedTitle);
        assertThat(createdNotification.getText()).isEqualTo(expectedText);
        assertThat(createdNotification.getTarget()).isEqualTo(expectedTarget);
        assertThat(createdNotification.getPriority()).isEqualTo(expectedPriority);
        assertThat(createdNotification.getAuthor()).isEqualTo(user);
    }

    /**
     * Shortcut method to call the checks for the created notification that has a manually set notification text.
     */
    private void checkCreatedNotificationWithNotificationText() {
        checkCreatedNotification(createdNotification, expectedTitle, notificationText, expectedTarget, expectedPriority);
    }

    /**
     * Shortcut method to call the checks for the created notification that has no manually set notification text but instead a different expected text.
     */
    private void checkCreatedNotificationWithoutNotificationText() {
        checkCreatedNotification(createdNotification, expectedTitle, expectedText, expectedTarget, expectedPriority);
    }

    /**
     * Auxiliary method to create the most common expected target with specific properties.
     * @param message is the message that should be included in the notification's target.
     * @param entity is the entity that should be pointed at in the notification's target.
     * @param relevantIdForCurrentTestCase is the id of a relevant object that should be part of the notification's target.
     * @return is the final notification target as a String.
     */
    private String createDefaultExpectedTarget(String message, String entity, Long relevantIdForCurrentTestCase) {
        return "{\"message\":\"" + message + "\",\"id\":" + relevantIdForCurrentTestCase + ",\"entity\":\"" + entity + "\",\"course\":" + courseId + ",\"mainPage\":\"courses\"}";
    }

    private enum Base {
        ATTACHMENT, EXERCISE, POST, ANSWER_POST, COURSE, EXAM
    }

    /**
     * Calls the real createNotification method of the groupNotificationFactory and tests if the result is correct.
     * Two notifications are created for those cases that might use a manually set notification text
     * @param base is the first input parameter used in the respective factory method to create the group notification.
     */
    private void createAndCheckNotification(Base base) {
        switch (base) {
            case ATTACHMENT: {
                createdNotification = groupNotificationFactory.createNotification(attachment, user, groupNotificationType, notificationType, notificationText);
                checkCreatedNotificationWithNotificationText();
                createdNotification = groupNotificationFactory.createNotification(attachment, user, groupNotificationType, notificationType, null);
                break;
            }
            case EXERCISE: {
                createdNotification = groupNotificationFactory.createNotification(exercise, user, groupNotificationType, notificationType, notificationText);
                checkCreatedNotificationWithNotificationText();
                createdNotification = groupNotificationFactory.createNotification(exercise, user, groupNotificationType, notificationType, null);
                break;
            }
            case POST: {
                createdNotification = groupNotificationFactory.createNotification(post, user, groupNotificationType, notificationType);
                break;
            }
            case ANSWER_POST: {
                createdNotification = groupNotificationFactory.createNotification(answerPost, user, groupNotificationType, notificationType);
                break;
            }
            case COURSE: {
                createdNotification = groupNotificationFactory.createNotification(course, user, groupNotificationType, notificationType, archiveErrors);
                break;
            }
            case EXAM: {
                createdNotification = groupNotificationFactory.createNotification(exam, user, groupNotificationType, notificationType, archiveErrors);
                break;
            }
        }
        checkCreatedNotificationWithoutNotificationText();
    }

    // Based on Attachment

    /**
     * Tests the functionality of the group notification factory that deals with notifications that originate from attachments.
     */
    @Test
    public void createNotificationBasedOnAttachment() {
        notificationType = NotificationType.ATTACHMENT_CHANGE;
        expectedTitle = "Attachment updated";
        expectedText = "Attachment \"" + attachment.getName() + "\" updated.";
        expectedTarget = createDefaultExpectedTarget("attachmentUpdated", "lectures", lectureId);
        expectedPriority = NotificationPriority.MEDIUM;

        createAndCheckNotification(Base.ATTACHMENT);
    }

    // Based on Exercise

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXERCISE_CREATED.
     * I.e. notifications that originate from a (newly) created exercise.
     */
    @Test
    public void createNotificationBasedOnExercise_withNotificationType_ExerciseCreated() {
        notificationType = NotificationType.EXERCISE_CREATED;
        expectedTitle = "Exercise created";
        expectedText = "A new exercise \"" + exercise.getTitle() + "\" got created.";
        expectedTarget = createDefaultExpectedTarget("exerciseCreated", "exercises", exerciseId);
        expectedPriority = NotificationPriority.MEDIUM;

        createAndCheckNotification(Base.EXERCISE);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXERCISE_PRACTICE.
     * I.e. notifications that originate from (quiz)exercises that were (just) opened for practice.
     */
    @Test
    public void createNotificationBasedOnExercise_withNotificationType_ExercisePractice() {
        notificationType = NotificationType.EXERCISE_PRACTICE;
        expectedTitle = "Exercise open for practice";
        expectedText = "Exercise \"" + exercise.getTitle() + "\" is now open for practice.";
        expectedTarget = createDefaultExpectedTarget("exerciseUpdated", "exercises", exerciseId);
        expectedPriority = NotificationPriority.MEDIUM;

        createAndCheckNotification(Base.EXERCISE);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of QUIZ_EXERCISE_STARTED.
     * I.e. notifications that originate from (just) started quiz exercises.
     */
    @Test
    public void createNotificationBasedOnExercise_withNotificationType_QuizExerciseStarted() {
        notificationType = NotificationType.QUIZ_EXERCISE_STARTED;
        expectedTitle = "Quiz started";
        expectedText = "Quiz \"" + exercise.getTitle() + "\" just started.";
        expectedTarget = createDefaultExpectedTarget("exerciseUpdated", "exercises", exerciseId);
        expectedPriority = NotificationPriority.MEDIUM;

        createAndCheckNotification(Base.EXERCISE);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXERCISE_UPDATED and are part of an exam.
     * I.e. notifications that originate from an updated exam exercise.
     */
    @Test
    public void createNotificationBasedOnExercise_withNotificationType_ExerciseUpdated_ExamExercise() {
        notificationType = NotificationType.EXERCISE_UPDATED;

        when(exercise.isExamExercise()).thenReturn(true);

        expectedTitle = Constants.LIVE_EXAM_EXERCISE_UPDATE_NOTIFICATION_TITLE;
        expectedPriority = NotificationPriority.HIGH;
        expectedText = "Exam Exercise \"" + exercise.getTitle() + "\" updated.";
        expectedTarget = "{\"problemStatement\":\"" + exercise.getProblemStatement() + "\",\"exercise\":" + exerciseId + ",\"exam\":" + examId + ",\"entity\":\"exams\",\"course\":"
                + courseId + ",\"mainPage\":\"courses\"}";

        // EXERCISE_UPDATED's implementation differs from the other types therefore the testing has to be adjusted (more explicit)

        // with notification text -> exam popup
        createdNotification = groupNotificationFactory.createNotification(exercise, user, groupNotificationType, notificationType, notificationText);
        checkCreatedNotificationWithNotificationText();

        // without notification text -> silent exam update (expectedText = null)
        createdNotification = groupNotificationFactory.createNotification(exercise, user, groupNotificationType, notificationType, null);
        checkCreatedNotification(createdNotification, expectedTitle, null, expectedTarget, NotificationPriority.HIGH);

        // set behavior back to course exercise
        when(exercise.isExamExercise()).thenReturn(false);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXERCISE_UPDATED and are course exercises.
     * I.e. notifications that originate from an updated course exercise (not part of an exam).
     */
    @Test
    public void createNotificationBasedOnExercise_withNotificationType_ExerciseUpdated_CourseExercise() {
        notificationType = NotificationType.EXERCISE_UPDATED;

        expectedTitle = "Exercise updated";
        expectedText = "Exercise \"" + exercise.getTitle() + "\" updated.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("exerciseUpdated", "exercises", exerciseId);

        createAndCheckNotification(Base.EXERCISE);
    }

    // Based on Post

    /**
     * Tests the functionality that deals with notifications that have the notification type of NEW_POST_FOR_EXERCISE.
     * I.e. notifications that originate from a new post concerning an exercise.
     */
    @Test
    public void createNotificationBasedOnPost_withNotificationType_NewPostForExercise() {
        notificationType = NotificationType.NEW_POST_FOR_EXERCISE;

        expectedTitle = "New Post";
        expectedText = "Exercise \"" + exercise.getTitle() + "\" got a new post.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("newPost", "exercises", exerciseId);

        createAndCheckNotification(Base.POST);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of NEW_POST_FOR_LECTURE.
     * I.e. notifications that originate from a new post concerning a lecture.
     */
    @Test
    public void createNotificationBasedOnPost_withNotificationType_NewPostForLecture() {
        notificationType = NotificationType.NEW_POST_FOR_LECTURE;

        expectedTitle = "New Post";
        expectedText = "Lecture \"" + lecture.getTitle() + "\" got a new post.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("newPost", "lectures", lectureId);

        createAndCheckNotification(Base.POST);
    }

    // Based on AnswerPost

    /**
     * Tests the functionality that deals with notifications that have the notification type of NEW_ANSWER_POST_FOR_EXERCISE.
     * I.e. notifications that originate from a new answer post concerning an exercise.
     */
    @Test
    public void createNotificationBasedOnAnswerPost_withNotificationType_NewAnswerPostForExercise() {
        notificationType = NotificationType.NEW_ANSWER_POST_FOR_EXERCISE;

        expectedTitle = "New Reply";
        expectedText = "Exercise \"" + exercise.getTitle() + "\" got a new reply.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("newAnswerPost", "exercises", exerciseId);

        createAndCheckNotification(Base.ANSWER_POST);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of NEW_ANSWER_POST_FOR_LECTURE.
     * I.e. notifications that originate from a new answer post concerning a lecture.
     */
    @Test
    public void createNotificationBasedOnAnswerPost_withNotificationType_NewAnswerPostForLecture() {
        notificationType = NotificationType.NEW_ANSWER_POST_FOR_LECTURE;

        expectedTitle = "New Reply";
        expectedText = "Lecture \"" + lecture.getTitle() + "\" got a new reply.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("newAnswerPost", "lectures", lectureId);

        createAndCheckNotification(Base.ANSWER_POST);
    }

    // Based on Course

    /**
     * Tests the functionality that deals with notifications that have the notification type of COURSE_ARCHIVE_STARTED.
     * I.e. notifications that are created when the process of archiving a course has been started.
     */
    @Test
    public void createNotificationBasedOnCourse_withNotificationType_CourseArchiveStarted() {
        notificationType = NotificationType.COURSE_ARCHIVE_STARTED;

        expectedTitle = "Course archival started";
        expectedText = "The course \"" + course.getTitle() + "\" is being archived.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("courseArchiveUpdated", "courses", courseId);

        createAndCheckNotification(Base.COURSE);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of COURSE_ARCHIVE_FINISHED.
     * I.e. notifications that are created when the process of archiving a course has finished.
     */
    @Test
    public void createNotificationBasedOnCourse_withNotificationType_CourseArchiveFinished() {
        notificationType = NotificationType.COURSE_ARCHIVE_FINISHED;

        expectedTitle = "Course archival finished";
        expectedText = "The course \"" + course.getTitle() + "\" has been archived.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("courseArchiveUpdated", "courses", courseId);

        createAndCheckNotification(Base.COURSE);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of COURSE_ARCHIVE_FAILED.
     * I.e. notifications that are created when the process of archiving a course has failed.
     */
    @Test
    public void createNotificationBasedOnCourse_withNotificationType_CourseArchiveFailed() {
        notificationType = NotificationType.COURSE_ARCHIVE_FAILED;

        expectedTitle = "Course archival failed";
        expectedText = "The was a problem archiving course \"" + course.getTitle() + "\": <br/><br/>" + String.join("<br/><br/>", archiveErrors);
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("courseArchiveUpdated", "courses", courseId);

        createAndCheckNotification(Base.COURSE);
    }

    // Based on Exam

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXAM_ARCHIVE_STARTED.
     * I.e. notifications that are created when the process of archiving an exam has been started.
     */
    @Test
    public void createNotificationBasedOnExam_withNotificationType_ExamArchiveStarted() {
        notificationType = NotificationType.EXAM_ARCHIVE_STARTED;

        expectedTitle = "Exam archival started";
        expectedText = "The exam \"" + exam.getTitle() + "\" is being archived.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("examArchiveUpdated", "courses", courseId);

        createAndCheckNotification(Base.EXAM);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXAM_ARCHIVE_FINISHED.
     * I.e. notifications that are created when the process of archiving an exam has finished.
     */
    @Test
    public void createNotificationBasedOnExam_withNotificationType_ExamArchiveFinished() {
        notificationType = NotificationType.EXAM_ARCHIVE_FINISHED;

        expectedTitle = "Exam archival finished";
        expectedText = "The exam \"" + exam.getTitle() + "\" has been archived.";
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("examArchiveUpdated", "courses", courseId);

        createAndCheckNotification(Base.EXAM);
    }

    /**
     * Tests the functionality that deals with notifications that have the notification type of EXAM_ARCHIVE_FAILED.
     * I.e. notifications that are created when the process of archiving an exam has failed.
     */
    @Test
    public void createNotificationBasedOnExam_withNotificationType_ExamArchiveFailed() {
        notificationType = NotificationType.EXAM_ARCHIVE_FAILED;

        expectedTitle = "Exam archival failed";
        expectedText = "The was a problem archiving exam \"" + exam.getTitle() + "\": <br/><br/>" + String.join("<br/><br/>", archiveErrors);
        expectedPriority = NotificationPriority.MEDIUM;
        expectedTarget = createDefaultExpectedTarget("examArchiveUpdated", "courses", courseId);

        createAndCheckNotification(Base.EXAM);
    }
}
