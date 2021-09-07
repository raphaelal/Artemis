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
import { of } from 'rxjs';
import { Course } from 'app/entities/course.model';
import { ComplaintsStudentViewComponent } from 'app/complaints/complaints-for-students/complaints-student-view.component';
import { ComplaintsFormComponent } from 'app/complaints/form/complaints-form.component';
import { ComplaintRequestComponent } from 'app/complaints/request/complaint-request.component';
import { ComplaintResponseComponent } from 'app/complaints/response/complaint-response.component';
import { AccountService } from 'app/core/auth/account.service';
import { User } from 'app/core/user/user.model';
import { MockAccountService } from '../../helpers/mocks/service/mock-account.service';

chai.use(sinonChai);
const expect = chai.expect;

describe('ComplaintInteractionsComponent', () => {
    const course: Course = { id: 1, complaintsEnabled: true, maxComplaintTimeDays: 7, requestMoreFeedbackEnabled: true, maxRequestMoreFeedbackTimeDays: 7 };
    const examExercise: Exercise = { id: 1, teamMode: false, course } as Exercise;
    const courseExercise: Exercise = { id: 1, teamMode: false, course, assessmentDueDate: moment().subtract(1, 'day') } as Exercise;
    const teamExercise: Exercise = { id: 1, teamMode: false, course } as Exercise;
    const submission: Submission = {} as Submission;
    const result: Result = { id: 1, completionDate: moment().subtract(2, 'day') } as Result;
    const user: User = { id: 1337 } as User;
    const participation: Participation = { id: 2, results: [result], submissions: [submission], student: user } as Participation;
    const exam: Exam = { examStudentReviewStart: moment().subtract(7, 'day'), examStudentReviewEnd: moment().add(7, 'day') } as Exam;
    const complaint = new Complaint();
    const numberOfComplaints = 42;

    let component: ComplaintsStudentViewComponent;
    let fixture: ComponentFixture<ComplaintsStudentViewComponent>;
    let complaintService: ComplaintService;
    let accountService: AccountService;

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
                component.participation = participation;
                component.result = result;
            });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Exam mode', () => {
        it('should initialize', fakeAsync(() => {
            component.exercise = examExercise;
            component.participation = participation;
            component.result = result;
            component.exam = exam;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(of());
            const numberOfAllowedComplaintsStub = sinon.stub(complaintService, 'getNumberOfAllowedComplaintsInCourse').returns(of(numberOfComplaints));
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
            component.participation = participation;
            component.result = result;
            component.exam = exam;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(of({ body: complaint } as EntityResponseType));
            const numberOfAllowedComplaintsStub = sinon.stub(complaintService, 'getNumberOfAllowedComplaintsInCourse').returns(of(numberOfComplaints));
            const userStub = sinon.stub(accountService, 'identity').returns(Promise.resolve(user));

            fixture.detectChanges();
            tick(100);

            expectExamDefault();
            expect(component.complaint).to.deep.equal(complaint);
            expect(complaintBySubmissionStub).to.have.been.calledOnce;
            expect(numberOfAllowedComplaintsStub).to.have.been.calledOnce;
            expect(userStub).to.have.been.calledOnce;
        }));

        function expectExamDefault() {
            expectDefault();
            expect(component.isExamMode).to.be.true;
            expect(component.timeOfFeedbackRequestValid).to.be.false;
            expect(component.timeOfComplaintValid).to.be.true;
        }
    });

    describe('Course mode', () => {
        it('should initialize', fakeAsync(() => {
            component.exercise = courseExercise;
            component.participation = participation;
            component.result = result;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(of());
            const numberOfAllowedComplaintsStub = sinon.stub(complaintService, 'getNumberOfAllowedComplaintsInCourse').returns(of(numberOfComplaints));
            const userStub = sinon.stub(accountService, 'identity').returns(Promise.resolve(user));

            fixture.detectChanges();
            tick(100);

            expectCourseDefault();
            expect(component.complaint).to.be.undefined;
            expect(complaintBySubmissionStub).to.have.been.calledOnce;
            expect(numberOfAllowedComplaintsStub).to.have.been.calledOnce;
            expect(userStub).to.have.been.calledOnce;
        }));

        it('should initialize with complaint', fakeAsync(() => {
            component.exercise = courseExercise;
            component.participation = participation;
            component.result = result;
            const complaintBySubmissionStub = sinon.stub(complaintService, 'findBySubmissionId').returns(of({ body: complaint } as EntityResponseType));
            const numberOfAllowedComplaintsStub = sinon.stub(complaintService, 'getNumberOfAllowedComplaintsInCourse').returns(of(numberOfComplaints));
            const userStub = sinon.stub(accountService, 'identity').returns(Promise.resolve(user));

            fixture.detectChanges();
            tick(100);

            expectCourseDefault();
            expect(component.complaint).to.deep.equal(complaint);
            expect(complaintBySubmissionStub).to.have.been.calledOnce;
            expect(numberOfAllowedComplaintsStub).to.have.been.calledOnce;
            expect(userStub).to.have.been.calledOnce;
        }));

        function expectCourseDefault() {
            expectDefault();
            expect(component.isExamMode).to.be.false;
            expect(component.timeOfFeedbackRequestValid).to.be.true;
            expect(component.timeOfComplaintValid).to.be.true;
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

    // xit('should check if there were valid complaints submitted in review period for different cases', () => {
    //     component.hasComplaint = false;
    //
    //     let getResult = component.noValidComplaintWasSubmittedWithinTheStudentReviewPeriod;
    //
    //     expect(getResult).to.be.true;
    //
    //     component.exercise.assessmentDueDate = result.completionDate!.subtract(1, 'days');
    //
    //     getResult = component.noValidComplaintWasSubmittedWithinTheStudentReviewPeriod;
    //
    //     expect(getResult).to.be.true;
    // });
    //
    // xit('should check if there were valid feedback requests submitted in review period for different cases', () => {
    //     let getResult = component.isTimeOfFeedbackRequestValid;
    //
    //     expect(getResult).to.be.false;
    //
    //     component.exercise.assessmentDueDate = result.completionDate!.subtract(1, 'days');
    //
    //     getResult = component.isTimeOfFeedbackRequestValid;
    //
    //     expect(getResult).to.be.false;
    //
    //     component.exam = exam;
    //
    //     getResult = component.isTimeOfFeedbackRequestValid;
    //
    //     expect(getResult).to.be.false;
    // });
});
