package de.tum.in.www1.artemis.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import de.tum.in.www1.artemis.domain.Course;
import de.tum.in.www1.artemis.domain.Exercise;
import de.tum.in.www1.artemis.domain.Lecture;
import de.tum.in.www1.artemis.domain.User;
import de.tum.in.www1.artemis.domain.lecture.AttachmentUnit;
import de.tum.in.www1.artemis.domain.lecture.ExerciseUnit;
import de.tum.in.www1.artemis.domain.lecture.LectureUnit;
import de.tum.in.www1.artemis.repository.CourseRepository;
import de.tum.in.www1.artemis.repository.LectureRepository;
import de.tum.in.www1.artemis.repository.UserRepository;
import de.tum.in.www1.artemis.security.Role;
import de.tum.in.www1.artemis.service.AuthorizationCheckService;
import de.tum.in.www1.artemis.service.ExerciseService;
import de.tum.in.www1.artemis.service.LectureService;
import de.tum.in.www1.artemis.web.rest.errors.BadRequestAlertException;
import de.tum.in.www1.artemis.web.rest.util.HeaderUtil;

/**
 * REST controller for managing Lecture.
 */
@RestController
@RequestMapping("/api")
public class LectureResource {

    private final Logger log = LoggerFactory.getLogger(LectureResource.class);

    private static final String ENTITY_NAME = "lecture";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LectureRepository lectureRepository;

    private final LectureService lectureService;

    private final CourseRepository courseRepository;

    private final AuthorizationCheckService authCheckService;

    private final UserRepository userRepository;

    private final ExerciseService exerciseService;

    public LectureResource(LectureRepository lectureRepository, LectureService lectureService, CourseRepository courseRepository, UserRepository userRepository,
            AuthorizationCheckService authCheckService, ExerciseService exerciseService) {
        this.lectureRepository = lectureRepository;
        this.lectureService = lectureService;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.authCheckService = authCheckService;
        this.exerciseService = exerciseService;
    }

    /**
     * POST lectures : Create a new lecture.
     *
     * @param lecture the lecture to create
     * @return the ResponseEntity with status 201 (Created) and with body the new lecture, or with status 400 (Bad Request) if the lecture has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("lectures")// TODO: should be /courses/{courseId}/lectures
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<Lecture> createLecture(@RequestBody Lecture lecture) throws URISyntaxException {
        log.debug("REST request to save Lecture : {}", lecture);
        if (lecture.getId() != null) {
            throw new BadRequestAlertException("A new lecture cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (lecture.getCourse() == null) {
            throw new BadRequestAlertException("lecture.course", "400", "The Lecture in the body should have a course object!");
        }
        User user = userRepository.getUserWithGroupsAndAuthorities();
        Long courseId = lecture.getCourse().getId(); // use the courseId in path instead after refactoring, then check if id matches in body
        Course course = courseRepository.findByIdElseThrow(courseId);
        authCheckService.checkHasAtLeastRoleInCourseElseThrow(Role.EDITOR, course, user);
        Lecture result = lectureRepository.save(lecture);
        return ResponseEntity.created(new URI("/api/lectures/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString())).body(result);
    }

    /**
     * PUT lectures/{lectureId} : Updates an existing lecture.
     *
     * @param lecture the lecture to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated lecture, or with status 400 (Bad Request) if the lecture is not valid, or with status 500 (Internal
     *         Server Error) if the lecture couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("lectures/{lectureId}")// TODO: should be /courses/{courseId}/lectures/{lectureId}
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<Lecture> updateLecture(@PathVariable Long lectureId, @RequestBody Lecture lecture) throws URISyntaxException {
        log.debug("REST request to update Lecture : {}", lecture);
        if (lecture.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!lecture.getId().equals(lectureId)) {
            throw new BadRequestAlertException("lectureId", ENTITY_NAME, "lectureId in body and path doent match!");
        }
        if (lecture.getCourse() == null) {
            throw new BadRequestAlertException("lecture.course", "400", "The Lecture in the body should have a course object!");
        }
        User user = userRepository.getUserWithGroupsAndAuthorities();
        Long courseId = lecture.getCourse().getId(); // use the courseId in path instead after refactoring, then check if id matches in body
        Course course = courseRepository.findByIdElseThrow(courseId);
        authCheckService.checkHasAtLeastRoleInCourseElseThrow(Role.EDITOR, course, user);

        // Make sure that the original references are preserved.
        Lecture originalLecture = lectureRepository.findByIdWithPostsAndLectureUnitsAndLearningGoalsElseThrow(lecture.getId());

        // NOTE: Make sure that all references are preserved here
        lecture.setLectureUnits(originalLecture.getLectureUnits());

        Lecture result = lectureRepository.save(lecture);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lecture.getId().toString())).body(result);
    }

    /**
     * GET courses/:courseId/lectures : get all the lectures of a course for the course administration page
     *
     * @param withLectureUnits if set associated lecture units will also be loaded
     * @param courseId the courseId of the course for which all lectures should be returned
     * @return the ResponseEntity with status 200 (OK) and the list of lectures in body
     */
    @GetMapping("courses/{courseId}/lectures")
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<Set<Lecture>> getLecturesForCourse(@PathVariable Long courseId, @RequestParam(required = false, defaultValue = "false") boolean withLectureUnits) {
        log.debug("REST request to get all Lectures for the course with id : {}", courseId);

        User user = userRepository.getUserWithGroupsAndAuthorities();
        Course course = courseRepository.findByIdElseThrow(courseId);
        authCheckService.checkHasAtLeastRoleInCourseElseThrow(Role.EDITOR, course, user);

        Set<Lecture> lectures;
        if (withLectureUnits) {
            lectures = lectureRepository.findAllByCourseIdWithAttachmentsAndLectureUnits(courseId);
        }
        else {
            lectures = lectureRepository.findAllByCourseIdWithAttachments(courseId);
        }

        return ResponseEntity.ok().body(lectures);
    }

    /**
     * GET lectures/:lectureId : get the "id" lecture.
     *
     * @param lectureId the id of the lecture to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the lecture, or with status 404 (Not Found)
     */
    @GetMapping("lectures/{lectureId}")// TODO: should be /courses/{courseId}/lectures/{lectureId}
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Lecture> getLecture(@PathVariable Long lectureId) {
        log.debug("REST request to get Lecture : {}", lectureId);
        Lecture lecture = lectureRepository.findByIdWithPostsAndLectureUnitsAndLearningGoalsElseThrow(lectureId);
        Course course = lecture.getCourse();
        if (course == null) {
            return ResponseEntity.badRequest().build();
        }
        User user = userRepository.getUserWithGroupsAndAuthorities();
        authCheckService.checkHasAtLeastRoleInCourseElseThrow(Role.STUDENT, course, user);
        lecture = filterLectureContentForUser(lecture, user);

        return ResponseEntity.ok(lecture);
    }

    /**
     * GET /lectures/:lectureId/title : Returns the title of the lecture with the given id
     *
     * @param lectureId the id of the lecture
     * @return the title of the lecture wrapped in an ResponseEntity or 404 Not Found if no lecture with that id exists
     */
    @GetMapping("/lectures/{lectureId}/title")// TODO: should be /courses/{courseId}/lectures/{lectureId}/title
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> getLectureTitle(@PathVariable Long lectureId) {
        final var title = lectureRepository.getLectureTitle(lectureId);
        return title == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(title);
    }

    private Lecture filterLectureContentForUser(Lecture lecture, User user) {
        lecture = lectureService.filterActiveAttachments(lecture, user);

        // The Objects::nonNull is needed here because the relationship lecture -> lecture units is ordered and
        // hibernate sometimes adds nulls into the list of lecture units to keep the order
        Set<Exercise> relatedExercises = lecture.getLectureUnits().stream().filter(Objects::nonNull).filter(lectureUnit -> lectureUnit instanceof ExerciseUnit)
                .map(lectureUnit -> ((ExerciseUnit) lectureUnit).getExercise()).collect(Collectors.toSet());

        Set<Exercise> exercisesUserIsAllowedToSee = exerciseService.filterOutExercisesThatUserShouldNotSee(relatedExercises, user);
        Set<Exercise> exercisesWithAllInformationNeeded = exerciseService
                .loadExercisesWithInformationForDashboard(exercisesUserIsAllowedToSee.stream().map(Exercise::getId).collect(Collectors.toSet()), user);

        List<LectureUnit> lectureUnitsUserIsAllowedToSee = lecture.getLectureUnits().stream().filter(lectureUnit -> {
            if (lectureUnit == null) {
                return false;
            }
            if (lectureUnit instanceof ExerciseUnit) {
                return ((ExerciseUnit) lectureUnit).getExercise() != null && authCheckService.isAllowedToSeeLectureUnit(lectureUnit, user)
                        && exercisesWithAllInformationNeeded.contains(((ExerciseUnit) lectureUnit).getExercise());
            }
            else if (lectureUnit instanceof AttachmentUnit) {
                return ((AttachmentUnit) lectureUnit).getAttachment() != null && authCheckService.isAllowedToSeeLectureUnit(lectureUnit, user);
            }
            else {
                return authCheckService.isAllowedToSeeLectureUnit(lectureUnit, user);
            }
        }).peek(lectureUnit -> {
            if (lectureUnit instanceof ExerciseUnit) {
                Exercise exercise = ((ExerciseUnit) lectureUnit).getExercise();
                // we replace the exercise with one that contains all the information needed for correct display
                exercisesWithAllInformationNeeded.stream().filter(exercise::equals).findAny().ifPresent(((ExerciseUnit) lectureUnit)::setExercise);
            }
        }).collect(Collectors.toList());

        lecture.setLectureUnits(lectureUnitsUserIsAllowedToSee);
        return lecture;
    }

    /**
     * DELETE /lectures/:lectureId : delete the "lectureId" lecture.
     *
     * @param lectureId the id of the lecture to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/lectures/{lectureId}")// TODO: should be /courses/{courseId}/lectures/{lectureId}
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<Void> deleteLecture(@PathVariable Long lectureId) {
        User user = userRepository.getUserWithGroupsAndAuthorities();
        Lecture lecture = lectureRepository.findByIdWithPostsAndLectureUnitsAndLearningGoalsElseThrow(lectureId);
        Course course = lecture.getCourse();
        if (course == null) {
            return ResponseEntity.badRequest().build();
        }
        authCheckService.checkHasAtLeastRoleInCourseElseThrow(Role.EDITOR, course, user);

        log.debug("REST request to delete Lecture : {}", lectureId);
        lectureService.delete(lecture);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, lectureId.toString())).build();
    }
}
