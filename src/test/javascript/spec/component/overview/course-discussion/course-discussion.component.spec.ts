import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Post } from 'app/entities/metis/post.model';
import * as sinon from 'sinon';
import { SinonSpy, spy, stub } from 'sinon';
import { CourseWideContext, DisplayPriority, PostSortCriterion, SortDirection } from 'app/shared/metis/metis.util';
import { PostingsThreadComponent } from 'app/shared/metis/postings-thread/postings-thread.component';
import { PostCreateEditModalComponent } from 'app/shared/metis/postings-create-edit-modal/post-create-edit-modal/post-create-edit-modal.component';
import { ButtonComponent } from 'app/shared/components/button.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { getElement } from '../../../helpers/utils/general.utils';
import { PageDiscussionSectionComponent } from 'app/overview/page-discussion-section/page-discussion-section.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MockComponent, MockDirective, MockModule, MockPipe } from 'ng-mocks';
import { Course } from 'app/entities/course.model';
import { CourseManagementService } from 'app/course/manage/course-management.service';
import { ArtemisTranslatePipe } from 'app/shared/pipes/artemis-translate.pipe';
import { MetisService } from 'app/shared/metis/metis.service';
import { ExerciseService } from 'app/exercises/shared/exercise/exercise.service';
import { MockExerciseService } from '../../../helpers/mocks/service/mock-exercise.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ArtemisTestModule } from '../../../test.module';
import { AnswerPostService } from 'app/shared/metis/answer-post.service';
import { MockAnswerPostService } from '../../../helpers/mocks/service/mock-answer-post.service';
import { PostService } from 'app/shared/metis/post.service';
import { MockPostService } from '../../../helpers/mocks/service/mock-post.service';
import { AccountService } from 'app/core/auth/account.service';
import { MockAccountService } from '../../../helpers/mocks/service/mock-account.service';
import { CourseDiscussionComponent } from 'app/overview/course-discussion/course-discussion.component';
import {
    metisAnswerPostUser1,
    metisCourse,
    metisCoursePosts,
    metisCoursePostsWithCourseWideContext,
    metisExercise,
    metisExercisePosts,
    metisLecture,
    metisLecturePosts,
    metisPostExerciseUser1,
    metisPostExerciseUser2,
    metisPostLectureUser1,
    metisPostLectureUser2,
    metisUpVoteReactionUser1,
} from '../../../helpers/sample/metis-sample-data';
import dayjs from 'dayjs';

chai.use(sinonChai);
const expect = chai.expect;

describe('CourseDiscussionComponent', () => {
    let component: CourseDiscussionComponent;
    let fixture: ComponentFixture<CourseDiscussionComponent>;
    let courseManagementService: CourseManagementService;
    let metisService: MetisService;
    let metisServiceGetFilteredPostsSpy: SinonSpy;
    let post1: Post;
    let post2: Post;
    let post3: Post;
    let post4: Post;
    let posts: Post[];

    const id = metisCourse.id;
    const parentRoute = {
        params: of({ id }),
    } as any as ActivatedRoute;
    const route = { parent: parentRoute } as any as ActivatedRoute;

    beforeEach(() => {
        return TestBed.configureTestingModule({
            imports: [ArtemisTestModule, HttpClientTestingModule, MockModule(FormsModule), MockModule(ReactiveFormsModule)],
            providers: [
                FormBuilder,
                { provide: ExerciseService, useClass: MockExerciseService },
                { provide: AnswerPostService, useClass: MockAnswerPostService },
                { provide: PostService, useClass: MockPostService },
                { provide: AccountService, useClass: MockAccountService },
                { provide: ActivatedRoute, useValue: route },
            ],
            declarations: [
                CourseDiscussionComponent,
                MockComponent(PostingsThreadComponent),
                MockComponent(PostCreateEditModalComponent),
                MockPipe(ArtemisTranslatePipe),
                MockDirective(NgbTooltip),
                MockComponent(ButtonComponent),
            ],
        })
            .overrideComponent(PageDiscussionSectionComponent, {
                set: {
                    providers: [{ provide: MetisService, useClass: MetisService }],
                },
            })
            .compileComponents()
            .then(() => {
                courseManagementService = TestBed.inject(CourseManagementService);
                stub(courseManagementService, 'findOneForDashboard').returns(of({ body: metisCourse }) as Observable<HttpResponse<Course>>);
                fixture = TestBed.createComponent(CourseDiscussionComponent);
                component = fixture.componentInstance;
                metisService = fixture.debugElement.injector.get(MetisService);
                metisServiceGetFilteredPostsSpy = spy(metisService, 'getFilteredPosts');
            });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should set course and posts for course on initialization', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(component.course).to.deep.equal(metisCourse);
        expect(component.createdPost).to.not.be.undefined;
        expect(component.posts).to.be.deep.equal(metisCoursePosts);
        expect(component.currentPostContextFilter).to.be.deep.equal({
            courseId: metisCourse.id,
            courseWideContext: undefined,
            exerciseId: undefined,
            lectureId: undefined,
        });
    }));

    it('should initialize formGroup correctly', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(component.formGroup.get('context')?.value).to.be.deep.equal({
            courseId: metisCourse.id,
            courseWideContext: undefined,
            exerciseId: undefined,
            lectureId: undefined,
        });
        expect(component.formGroup.get('sortBy')?.value).to.be.equal(PostSortCriterion.CREATION_DATE);
        expect(component.formGroup.get('sortDirection')?.value).to.be.equal(SortDirection.DESC);
    }));

    it('should initialize overview page with course posts for default settings correctly', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(component.formGroup.get('context')?.value).to.be.deep.equal({
            courseId: metisCourse.id,
            courseWideContext: undefined,
            exerciseId: undefined,
            lectureId: undefined,
        });
        expect(component.formGroup.get('sortBy')?.value).to.be.equal(PostSortCriterion.CREATION_DATE);
        expect(component.formGroup.get('sortDirection')?.value).to.be.equal(SortDirection.DESC);
        fixture.detectChanges();
        const searchInput = getElement(fixture.debugElement, 'input[name=searchText]');
        expect(searchInput.textContent).to.be.equal('');
        const contextOptions = getElement(fixture.debugElement, 'select[name=context]');
        // select should provide all context options
        expect(contextOptions.textContent).contains(metisCourse.title);
        expect(contextOptions.textContent).contains(metisLecture.title);
        expect(contextOptions.textContent).contains(metisExercise.title);
        // course should be selected
        const selectedContextOption = getElement(fixture.debugElement, 'select[name=context]');
        expect(selectedContextOption.value).contains(metisCourse.title);
        // creation date should be selected as sort criterion
        const selectedSortByOption = getElement(fixture.debugElement, 'select[name=sortBy]');
        expect(selectedSortByOption.value).to.exist;
        // descending should be selected as sort direction
        const selectedDirectionOption = getElement(fixture.debugElement, 'select[name=sortDirection]');
        expect(selectedDirectionOption.value).to.exist;
        // show correct number of posts found
        const postCountInformation = getElement(fixture.debugElement, '.post-result-information');
        expect(postCountInformation.innerHTML).to.not.be.empty;
    }));

    it('should invoke metis service without forcing a reload when search text changed', fakeAsync(() => {
        component.ngOnInit();
        tick();
        component.onSearch();
        expect(metisServiceGetFilteredPostsSpy).to.have.been.calledWith(
            {
                courseId: metisCourse.id,
                courseWideContext: undefined,
                exerciseId: undefined,
                lectureId: undefined,
            },
            false, // forceReload false
        );
    }));

    it('should fetch new posts when context filter changes to course-wide-context', fakeAsync(() => {
        component.ngOnInit();
        tick();
        fixture.detectChanges();
        component.formGroup.patchValue({
            context: {
                courseId: undefined,
                courseWideContext: CourseWideContext.ORGANIZATION,
                exerciseId: undefined,
                lectureId: undefined,
            },
        });
        const contextOptions = getElement(fixture.debugElement, 'select[name=context]');
        contextOptions.dispatchEvent(new Event('change'));
        tick();
        fixture.detectChanges();
        expect(metisServiceGetFilteredPostsSpy).to.have.been.called;
        expect(component.posts).to.be.deep.equal(metisCoursePostsWithCourseWideContext.filter((post) => post.courseWideContext === CourseWideContext.ORGANIZATION));
    }));

    it('should fetch new posts when context filter changes to exercise', fakeAsync(() => {
        component.ngOnInit();
        tick();
        fixture.detectChanges();
        component.formGroup.patchValue({
            context: {
                courseId: undefined,
                courseWideContext: undefined,
                exerciseId: metisExercise.id,
                lectureId: undefined,
            },
        });
        const contextOptions = getElement(fixture.debugElement, 'select[name=context]');
        contextOptions.dispatchEvent(new Event('change'));
        tick();
        fixture.detectChanges();
        expect(metisServiceGetFilteredPostsSpy).to.have.been.called;
        expect(component.posts).to.be.deep.equal(metisExercisePosts);
    }));

    it('should fetch new posts when context filter changes to lecture', fakeAsync(() => {
        component.ngOnInit();
        tick();
        fixture.detectChanges();
        component.formGroup.patchValue({
            context: {
                courseId: undefined,
                courseWideContext: undefined,
                exerciseId: undefined,
                lectureId: metisLecture.id,
            },
        });
        const contextOptions = getElement(fixture.debugElement, 'select[name=context]');
        contextOptions.dispatchEvent(new Event('change'));
        tick();
        fixture.detectChanges();
        expect(metisServiceGetFilteredPostsSpy).to.have.been.called;
        expect(component.posts).to.be.deep.equal(metisLecturePosts);
    }));

    it('should invoke metis service without forcing a reload when sort criterion changed', fakeAsync(() => {
        component.ngOnInit();
        tick();
        fixture.detectChanges();
        const sortByOptions = getElement(fixture.debugElement, 'select[name=sortBy]');
        sortByOptions.dispatchEvent(new Event('change'));
        expect(metisServiceGetFilteredPostsSpy).to.have.been.calledWith(
            {
                courseId: metisCourse.id,
                courseWideContext: undefined,
                exerciseId: undefined,
                lectureId: undefined,
            },
            false, // forceReload false
        );
    }));

    it('should invoke metis service without forcing a reload when sort direction changed', fakeAsync(() => {
        component.ngOnInit();
        tick();
        fixture.detectChanges();
        const sortByOptions = getElement(fixture.debugElement, 'select[name=sortDirection]');
        sortByOptions.dispatchEvent(new Event('change'));
        expect(metisServiceGetFilteredPostsSpy).to.have.been.calledWith(
            {
                courseId: metisCourse.id,
                courseWideContext: undefined,
                exerciseId: undefined,
                lectureId: undefined,
            },
            false, // forceReload false
        );
    }));

    describe('sorting of posts', () => {
        beforeEach(() => {
            post1 = metisPostExerciseUser1;
            post1.creationDate = dayjs();
            post1.displayPriority = DisplayPriority.PINNED;

            post2 = metisPostExerciseUser2;
            post2.creationDate = dayjs().subtract(1, 'day');
            post2.displayPriority = DisplayPriority.NONE;

            post3 = metisPostLectureUser1;
            post3.creationDate = dayjs().subtract(2, 'day');
            post3.reactions = [metisUpVoteReactionUser1];
            post3.answers = [metisAnswerPostUser1];
            post3.displayPriority = DisplayPriority.NONE;

            post4 = metisPostLectureUser2;
            post4.creationDate = dayjs().subtract(2, 'minute');
            post4.reactions = [metisUpVoteReactionUser1];
            post4.displayPriority = DisplayPriority.ARCHIVED;

            posts = [post1, post2, post3, post4];
        });

        it('should sort posts correctly by creation date desc', () => {
            component.currentSortCriterion = PostSortCriterion.CREATION_DATE;
            component.currentSortDirection = SortDirection.DESC;
            posts = posts.sort(component.overviewSortFn);
            // pinned is first, archived is last independent of sort criterion
            expect(posts).to.be.deep.equal([post1, post2, post3, post4]);
        });

        it('should sort posts correctly by creation date asc', () => {
            component.currentSortCriterion = PostSortCriterion.CREATION_DATE;
            component.currentSortDirection = SortDirection.ASC;
            posts = posts.sort(component.overviewSortFn);
            // pinned is first, archived is last independent of sort criterion
            expect(posts).to.be.deep.equal([post1, post3, post2, post4]);
        });

        it('should sort posts correctly by votes desc', () => {
            component.currentSortCriterion = PostSortCriterion.VOTES;
            component.currentSortDirection = SortDirection.DESC;
            posts = posts.sort(component.overviewSortFn);
            // pinned is first, archived is last independent of sort criterion
            expect(posts).to.be.deep.equal([post1, post3, post2, post4]);
        });

        it('should sort posts correctly by votes asc', () => {
            component.currentSortCriterion = PostSortCriterion.VOTES;
            component.currentSortDirection = SortDirection.ASC;
            posts = posts.sort(component.overviewSortFn);
            // pinned is first, archived is last independent of sort criterion
            expect(posts).to.be.deep.equal([post1, post2, post3, post4]);
        });

        it('should sort posts correctly by answer count desc', () => {
            component.currentSortCriterion = PostSortCriterion.ANSWER_COUNT;
            component.currentSortDirection = SortDirection.DESC;
            posts = posts.sort(component.overviewSortFn);
            // pinned is first, archived is last independent of sort criterion
            expect(posts).to.be.deep.equal([post1, post3, post2, post4]);
        });

        it('should sort posts correctly by answer count asc', () => {
            component.currentSortCriterion = PostSortCriterion.ANSWER_COUNT;
            component.currentSortDirection = SortDirection.ASC;
            posts = posts.sort(component.overviewSortFn);
            // pinned is first, archived is last independent of sort criterion
            expect(posts).to.be.deep.equal([post1, post2, post3, post4]);
        });

        it('should distinguish context filter options for properly show them in form', () => {
            let result = component.compareContextFilterOptionFn({ courseId: metisCourse.id }, { courseId: metisCourse.id });
            expect(result).to.be.equal(true);
            result = component.compareContextFilterOptionFn({ courseId: metisCourse.id }, { courseId: 99 });
            expect(result).to.be.equal(false);
            result = component.compareContextFilterOptionFn({ lectureId: metisLecture.id }, { lectureId: metisLecture.id });
            expect(result).to.be.equal(true);
            result = component.compareContextFilterOptionFn({ lectureId: metisLecture.id }, { lectureId: 99 });
            expect(result).to.be.equal(false);
            result = component.compareContextFilterOptionFn({ exerciseId: metisExercise.id }, { exerciseId: metisExercise.id });
            expect(result).to.be.equal(true);
            result = component.compareContextFilterOptionFn({ exerciseId: metisExercise.id }, { exerciseId: 99 });
            expect(result).to.be.equal(false);
            result = component.compareContextFilterOptionFn({ courseWideContext: CourseWideContext.ORGANIZATION }, { courseWideContext: CourseWideContext.ORGANIZATION });
            expect(result).to.be.equal(true);
            result = component.compareContextFilterOptionFn({ courseWideContext: CourseWideContext.ORGANIZATION }, { courseWideContext: CourseWideContext.TECH_SUPPORT });
            expect(result).to.be.equal(false);
        });
    });
});
