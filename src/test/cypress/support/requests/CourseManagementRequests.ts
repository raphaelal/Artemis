import { ExerciseRequests } from './ExerciseRequests';
import { BASE_API, DELETE, POST } from '../constants';
import courseTemplate from '../../fixtures/requests/course.json';
import { CypressCredentials } from '../users';
import { generateUUID } from '../utils';
import day from 'dayjs';

export const COURSE_BASE = BASE_API + 'courses/';
export const PROGRAMMING_EXERCISE_BASE = BASE_API + 'programming-exercises/';
export const MODELING_EXERCISE_BASE = BASE_API + 'modeling-exercises/';

/**
 * A class which encapsulates all cypress requests related to course management.
 */
export class CourseManagementRequests extends ExerciseRequests {
    /**
     * Deletes the course with the specified id.
     * @param id the course id
     * @returns <Chainable> request response
     */
    deleteCourse(id: number) {
        return cy.request({ method: DELETE, url: COURSE_BASE + id });
    }

    /**
     * Creates a course with the specified title and short name.
     * @param courseName the title of the course (will generate default name if not provided)
     * @param courseShortName the short name (will generate default name if not provided)
     * @returns <Chainable> request response
     */
    createCourse(courseName = 'Cypress course' + generateUUID(), courseShortName = 'cypress' + generateUUID()) {
        const course = courseTemplate;
        course.title = courseName;
        course.shortName = courseShortName;
        return cy.request({
            url: BASE_API + 'courses',
            method: POST,
            body: course,
        });
    }

    /**
     * Deletes the programming exercise with the specified id.
     * @param id the exercise id
     * @returns <Chainable> request response
     */
    deleteProgrammingExercise(id: number) {
        return cy.request({ method: DELETE, url: PROGRAMMING_EXERCISE_BASE + id + '?deleteStudentReposBuildPlans=true&deleteBaseReposBuildPlans=true' });
    }

    /**
     * Adds the specified student to the course.
     * @param courseId the course id
     * @param studentName the student name
     * @returns <Chainable> request response
     */
    addStudentToCourse(courseId: number, studentName: string) {
        return cy.request({ url: COURSE_BASE + courseId + '/students/' + studentName, method: POST });
    }

    /**
     * Adds the specified user to the tutor group in the course
     */
    addTutorToCourse(course: any, user: CypressCredentials) {
        return cy.request({ method: POST, url: COURSE_BASE + course.id + '/tutors/' + user.username });
    }

    /**
     * Creates a programming exercise with the specified settings and adds it to the provided course.
     * @param title the title of the programming exercise
     * @param programmingShortName the short name of the programming exercise
     * @param packageName the package name of the programming exercise
     * @param course the course object returned by a create course request
     * @param releaseDate when the programming exercise should be available (default is now)
     * @param dueDate when the programming exercise should be due (default is now + 1 day)
     * @returns <Chainable> request
     */
    createProgrammingExercise(
        course: any,
        title = 'Cypress programming exercise ' + generateUUID(),
        programmingShortName = 'cypress' + generateUUID(),
        packageName = 'de.test',
        releaseDate = day(),
        dueDate = day().add(1, 'days'),
    ) {
        return super.createProgrammingExercise({ course }, title, programmingShortName, packageName, releaseDate, dueDate);
    }

    /**
     * Creates an exam with the provided settings.
     * @param exam the exam object created by a {@link CypressExamBuilder}
     * @returns <Chainable> request response
     */
    createExam(exam: any) {
        return cy.request({ url: COURSE_BASE + exam.course.id + '/exams', method: POST, body: exam });
    }

    /**
     * Deletes the exam with the given parameters
     * @returns <Chainable> request response
     * */
    deleteExam(exam: any) {
        return cy.request({ method: DELETE, url: COURSE_BASE + exam.course.id + '/exams/' + exam.id });
    }

    /**
     * register the student for the exam
     * @returns <Chainable> request response
     */
    registerStudentForExam(exam: any, student: CypressCredentials) {
        return cy.request({ method: POST, url: COURSE_BASE + exam.course.id + '/exams/' + exam.id + '/students/' + student.username });
    }

    /**
     * generate all missing individual exams
     * @returns <Chainable> request response
     */
    generateMissingIndividualExams(exam: any) {
        return cy.request({ method: POST, url: COURSE_BASE + exam.course.id + '/exams/' + exam.id + '/generate-missing-student-exams' });
    }

    /**
     * Creates a text exercise with the specified settings and adds it to the specified course.
     * @param course the course object
     * @param title the title of the text exercise
     * @returns <Chainable> request response
     */
    createTextExercise(course: any, title = 'Text exercise ' + generateUUID()) {
        return super.createTextExercise({ course }, title);
    }

    prepareExerciseStartForExam(exam: any) {
        return cy.request({ method: POST, url: COURSE_BASE + exam.course.id + '/exams/' + exam.id + '/student-exams/start-exercises' });
    }

    deleteModelingExercise(exerciseID: number) {
        return cy.request({
            url: MODELING_EXERCISE_BASE + exerciseID,
            method: DELETE,
        });
    }

    /**
     * Creates a modeling exercise with the specified settings and adds it to the specified course.
     * @param modelingExercise the modeling exercise object
     * @param course the course object
     * @returns <Chainable> request
     */
    createModelingExercise(modelingExercise: any, course: any) {
        return super.createModelingExercise(modelingExercise, { course });
    }
}
