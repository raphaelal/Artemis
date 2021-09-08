import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as chai from 'chai';
import { ComplaintService, EntityResponseType } from 'app/complaints/complaint.service';
import { MockComplaintService } from '../../helpers/mocks/service/mock-complaint.service';
import { TranslateModule } from '@ngx-translate/core';
import { ArtemisTestModule } from '../../test.module';
import { Exercise } from 'app/entities/exercise.model';
import { ArtemisTranslatePipe } from 'app/shared/pipes/artemis-translate.pipe';
import { MockComponent, MockPipe } from 'ng-mocks';
import { Participation } from 'app/entities/participation/participation.model';
import { Result } from 'app/entities/result.model';
import { Exam } from 'app/entities/exam.model';
import { Submission } from 'app/entities/submission.model';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as moment from 'moment';
import { Complaint } from 'app/entities/complaint.model';
import { Observable, of } from 'rxjs';
import { Course } from 'app/entities/course.model';
import { ComplaintsStudentViewComponent } from 'app/complaints/complaints-for-students/complaints-student-view.component';
import { ComplaintsFormComponent } from 'app/complaints/form/complaints-form.component';
import { ComplaintRequestComponent } from 'app/complaints/request/complaint-request.component';
import { ComplaintResponseComponent } from 'app/complaints/response/complaint-response.component';
import { AccountService } from 'app/core/auth/account.service';
import { User } from 'app/core/user/user.model';
import { MockAccountService } from '../../helpers/mocks/service/mock-account.service';
import { ArtemisServerDateService } from 'app/shared/server-date.service';

chai.use(sinonChai);
const expect = chai.expect;

describe('ComplaintInteractionsComponent', () => {
    const complaintTimeLimitDays = 7;
    const course: Course = {
        id: 1,
        complaintsEnabled: true,
        maxComplaintTimeDays: complaintTimeLimitDays,
        requestMoreFeedbackEnabled: true,
        maxRequestMoreFeedbackTimeDays: complaintTimeLimitDays,
    };
    const courseWithoutFeedback: Course = { id: 1, complaintsEnabled: true, maxComplaintTimeDays: 7, requestMoreFeedbackEnabled: false };
    const examExercise: Exercise = { id: 1, teamMode: false, course } as Exercise;
    const courseExercise: Exercise = { id: 1, teamMode: false, course, assessmentDueDate: moment().subtract(1, 'day') } as Exercise;
    const submission: Submission = {} as Submission;
    const result: Result = { id: 1, completionDate: moment().subtract(complaintTimeLimitDays - 1, 'day') } as Result;
    const resultWithoutCompletionDate: Result = { id: 1 } as Result;
    const user: User = { id: 1337 } as User;
    const participation: Participation = { id: 2, results: [result], submissions: [submission], student: user } as Participation;
    const defaultExam: Exam = {
        examStudentReviewStart: moment().subtract(complaintTimeLimitDays, 'day'),
        examStudentReviewEnd: moment().add(complaintTimeLimitDays, 'day'),
    } as Exam;
    const complaint = new Complaint();
    const numberOfComplaints = 42;

    let component: ComplaintsStudentViewComponent;
    let fixture: ComponentFixture<ComplaintsStudentViewComponent>;
    let complaintService: ComplaintService;
    let accountService: AccountService;
    let serverDateService: ArtemisServerDateService;
    let numberOfAllowedComplaintsStub: sinon.SinonStub<[courseId: number, teamMode?: boolean | undefined], Observable<number>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ArtemisTestModule],
            declarations: [
                ComplaintsStudentViewComponent,
                MockPipe(ArtemisTranslatePipe),
                MockComponent(ComplaintsFormComponent),
                MockComponent(ComplaintRequestComponent),
                MockComponent(ComplaintResponseComponent),
            ],
            providers: [
                {
                    provide: ComplaintService,
                    useClass: MockComplaintService,
                },
                {
                    provide: AccountService,
                    useClass: MockAccountService,
                },
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(ComplaintsStudentViewComponent);
                component = fixture.componentInstance;
                complaintService = TestBed.inject(ComplaintService);
                accountService = TestBed.inject(AccountService);
                serverDateService = TestBed.inject(ArtemisServerDateService);
                component.participation = participation;
                component.result = result;
                numberOfAllowedComplaintsStub = sinon.stub(complaintService, 'getNumberOfAllowedComplaintsInCourse').returns(of(numberOfComplaints));
            });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Exam mode', () => {
        it('should initialize', fakeAsync(() => {
            component.exercise = examExercise;
            component.result = result;
            component.exam = defaultExam;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(of());
            const userStub = sinon.stub(accountService, 'identity').returns(Promise.resolve(user));

            fixture.detectChanges();
            tick(100);

            expectExamDefault();
            expect(component.complaint).to.be.undefined;
            expect(complaintBySubmissionStub).to.have.been.calledOnce;
            expect(numberOfAllowedComplaintsStub).to.have.been.calledOnce;
            expect(userStub).to.have.been.calledOnce;
        }));

        it('should initialize with complaint', fakeAsync(() => {
            component.exercise = examExercise;
            component.result = result;
            component.exam = defaultExam;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(of({ body: complaint } as EntityResponseType));
            const userStub = sinon.stub(accountService, 'identity').returns(Promise.resolve(user));

            fixture.detectChanges();
            tick(100);

            expectExamDefault();
            expect(component.complaint).to.deep.equal(complaint);
            expect(complaintBySubmissionStub).to.have.been.calledOnce;
            expect(numberOfAllowedComplaintsStub).to.have.been.calledOnce;
            expect(userStub).to.have.been.calledOnce;
        }));

        it('should be visible on test run', fakeAsync(() => {
            const now = moment();
            const examWithFutureReview: Exam = { examStudentReviewStart: moment(now).add(1, 'day'), examStudentReviewEnd: moment(now).add(2, 'day') } as Exam;
            const serverDateStub = sinon.stub(serverDateService, 'now').returns(moment());
            component.exercise = examExercise;
            component.result = result;
            component.exam = examWithFutureReview;
            component.testRun = true;

            fixture.detectChanges();
            tick(100);

            expect(component.showComplaintsSection).to.be.true;
            expect(serverDateStub).to.have.not.been.called;
        }));

        it('should be hidden if review start not set', fakeAsync(() => {
            const examWithoutReviewStart: Exam = { examStudentReviewEnd: moment() } as Exam;
            testVisibilityToBeHiddenWithExam(examWithoutReviewStart);
        }));

        it('should be hidden if review end not set', fakeAsync(() => {
            const examWithoutReviewEnd: Exam = { examStudentReviewStart: moment() } as Exam;
            testVisibilityToBeHiddenWithExam(examWithoutReviewEnd);
        }));

        function expectExamDefault() {
            expectDefault();
            expect(component.isExamMode).to.be.true;
            expect(component.timeOfFeedbackRequestValid).to.be.false;
            expect(component.timeOfComplaintValid).to.be.true;
        }

        function testVisibilityToBeHiddenWithExam(exam: Exam) {
            sinon.stub(complaintService, 'findBySubmissionId').returns(of());

            component.exercise = examExercise;
            component.result = result;
            component.exam = exam;

            fixture.detectChanges();
            tick(100);

            expect(component.showComplaintsSection).to.be.false;
        }
    });

    describe('Course mode', () => {
        it('should initialize', fakeAsync(() => {
            testInitWithResultStub(of());
            expect(component.complaint).to.be.undefined;
        }));

        it('should initialize with complaint', fakeAsync(() => {
            testInitWithResultStub(of({ body: complaint } as EntityResponseType));
            expect(component.complaint).to.deep.equal(complaint);
        }));

        it('should not be available if before or at assessment due date', fakeAsync(() => {
            const exercise: Exercise = { id: 1, teamMode: false, course: courseWithoutFeedback, assessmentDueDate: moment() } as Exercise;
            const resultMatchingDate: Result = { id: 1, completionDate: moment(exercise.assessmentDueDate) } as Result;
            component.exercise = exercise;
            component.result = resultMatchingDate;

            fixture.detectChanges();
            tick(100);

            expect(component.timeOfFeedbackRequestValid).to.be.false;
            expect(component.timeOfComplaintValid).to.be.false;
        }));

        it('should not be available if assessment due date not set and completion date is out of period', fakeAsync(() => {
            const exercise: Exercise = { id: 1, teamMode: false, course: courseWithoutFeedback } as Exercise;
            const resultDateOutOfLimits: Result = { id: 1, completionDate: moment().subtract(complaintTimeLimitDays + 1, 'day') } as Result;
            component.exercise = exercise;
            component.result = resultDateOutOfLimits;

            fixture.detectChanges();
            tick(100);

            expect(component.timeOfFeedbackRequestValid).to.be.false;
            expect(component.timeOfComplaintValid).to.be.false;
        }));

        it('should not be available if completionDate after assessment due date and date is out of period', fakeAsync(() => {
            const exercise: Exercise = {
                id: 1,
                teamMode: false,
                course: courseWithoutFeedback,
                assessmentDueDate: moment().subtract(complaintTimeLimitDays + 2),
            } as Exercise;
            const resultMatchingDate: Result = { id: 1, completionDate: moment(exercise.assessmentDueDate!).add(1, 'day') } as Result;
            component.exercise = exercise;
            component.result = resultMatchingDate;

            fixture.detectChanges();
            tick(100);

            expect(component.timeOfFeedbackRequestValid).to.be.false;
            expect(component.timeOfComplaintValid).to.be.false;
        }));

        function expectCourseDefault() {
            expectDefault();
            expect(component.isExamMode).to.be.false;
            expect(component.timeOfFeedbackRequestValid).to.be.true;
            expect(component.timeOfComplaintValid).to.be.true;
        }

        function testInitWithResultStub(content: Observable<EntityResponseType>) {
            component.exercise = courseExercise;
            component.result = result;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(content);
            const userStub = sinon.stub(accountService, 'identity').returns(Promise.resolve(user));

            fixture.detectChanges();
            tick(100);

            expectCourseDefault();
            expect(complaintBySubmissionStub).to.have.been.calledOnce;
            expect(numberOfAllowedComplaintsStub).to.have.been.calledOnce;
            expect(userStub).to.have.been.calledOnce;
        }
    });

    function expectDefault() {
        expect(component.submission).to.deep.equal(submission);
        expect(component.course).to.deep.equal(course);
        expect(component.showComplaintsSection).to.be.true;
        expect(component.formComplaintType).to.be.undefined;
        expect(component.numberOfAllowedComplaints).to.be.eq(numberOfComplaints);
        expect(component.isCurrentUserSubmissionAuthor).to.be.true;
        expect(result.participation).to.deep.equal(participation);
    }

    it('should set time of complaint invalid without completion date', fakeAsync(() => {
        const participationWithoutCompletionDate: Participation = { id: 2, results: [resultWithoutCompletionDate], submissions: [submission], student: user } as Participation;
        component.exercise = courseExercise;
        component.participation = participationWithoutCompletionDate;
        component.result = resultWithoutCompletionDate;

        fixture.detectChanges();
        tick(100);

        expect(component.timeOfComplaintValid).to.be.false;
    }));
});
