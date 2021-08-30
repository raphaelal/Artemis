import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Post } from 'app/entities/metis/post.model';
import * as sinon from 'sinon';
import { SinonStub, stub } from 'sinon';
import * as moment from 'moment';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MockPipe, MockDirective, MockComponent } from 'ng-mocks';
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
import { PageDiscussionSectionComponent } from 'app/overview/page-discussion-section/page-discussion-section.component';
import { CourseDiscussionComponent } from 'app/overview/course-discussion/course-discussion.component';
import {
    metisCourse,
    metisCoursePosts,
    metisPostExerciseUser1,
    metisPostExerciseUser2,
    metisPostLectureUser1,
    metisPostLectureUser2,
    metisUpVoteReactionUser1,
} from '../../../helpers/sample/metis-sample-data';
import { DisplayPriority } from 'app/shared/metis/metis.util';
import { CourseScoreCalculationService } from 'app/overview/course-score-calculation.service';
import { PostingsThreadComponent } from 'app/shared/metis/postings-thread/postings-thread.component';
import { PostCreateEditModalComponent } from 'app/shared/metis/postings-create-edit-modal/post-create-edit-modal/post-create-edit-modal.component';

chai.use(sinonChai);
const expect = chai.expect;

describe('CourseDiscussionComponent', () => {
    let component: CourseDiscussionComponent;
    let fixture: ComponentFixture<CourseDiscussionComponent>;
    let courseScoreCalculationService: CourseScoreCalculationService;
    let getCourseStub: SinonStub;
    let post1: Post;
    let post2: Post;
    let post3: Post;
    let post4: Post;

    beforeEach(() => {
        return TestBed.configureTestingModule({
            imports: [ArtemisTestModule, HttpClientTestingModule],
            providers: [
                { provide: ExerciseService, useClass: MockExerciseService },
                { provide: AnswerPostService, useClass: MockAnswerPostService },
                { provide: PostService, useClass: MockPostService },
                { provide: AccountService, useClass: MockAccountService },
            ],
            declarations: [
                PageDiscussionSectionComponent,
                MockComponent(PostingsThreadComponent),
                MockComponent(PostCreateEditModalComponent),
                MockPipe(ArtemisTranslatePipe),
                MockDirective(NgbTooltip),
            ],
        })
            .overrideComponent(PageDiscussionSectionComponent, {
                set: {
                    providers: [{ provide: MetisService, useClass: MetisService }],
                },
            })
            .compileComponents()
            .then(() => {
                courseScoreCalculationService = TestBed.inject(CourseScoreCalculationService);
                getCourseStub = stub(courseScoreCalculationService, 'getCourse');
                getCourseStub.returns(metisCourse);
                fixture = TestBed.createComponent(CourseDiscussionComponent);
                component = fixture.componentInstance;
                fixture.debugElement.injector.get(MetisService);
            });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should set course and posts for exercise on initialization', fakeAsync(() => {
        tick();
        expect(component.course).to.deep.equal(metisCourse);
        expect(component.createdPost).to.not.be.undefined;
        expect(component.posts).to.be.deep.equal(metisCoursePosts);
        expect(component.currentPostContextFilter).to.be.deep.equal({ courseId: metisCourse.id, courseWideContext: undefined, exerciseId: undefined, lectureId: undefined });
        expect(component.currentPostContentFilter).to.be.deep.equal({ searchText: undefined });
    }));

    it('should sort posts correctly', () => {
        post1 = metisPostExerciseUser1;
        post1.creationDate = moment();
        post1.displayPriority = DisplayPriority.PINNED;

        post2 = metisPostExerciseUser2;
        post2.creationDate = moment().subtract(1, 'day');
        post2.displayPriority = DisplayPriority.NONE;

        post3 = metisPostLectureUser1;
        post3.creationDate = moment().subtract(2, 'day');
        post3.reactions = [metisUpVoteReactionUser1];
        post3.displayPriority = DisplayPriority.NONE;

        post4 = metisPostLectureUser2;
        post4.creationDate = moment().subtract(2, 'minute');
        post4.reactions = [metisUpVoteReactionUser1];
        post4.displayPriority = DisplayPriority.ARCHIVED;

        let posts = [post1, post2, post3, post4];
        posts = posts.sort(component.overviewSortFn);
        expect(posts).to.be.deep.equal([post1, post3, post2, post4]);
    });
});
