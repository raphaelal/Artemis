import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as chai from 'chai';
import { ComplaintService, EntityResponseType } from 'app/complaints/complaint.service';
import { MockComplaintService } from '../../helpers/mocks/service/mock-complaint.service';

import { MomentModule } from 'ngx-moment';
import { TranslateModule } from '@ngx-translate/core';
import { ComplaintsFormComponent } from 'app/complaints/form/complaints-form.component';
import { ArtemisTestModule } from '../../test.module';
import { ArtemisSharedModule } from 'app/shared/shared.module';
import { Exercise } from 'app/entities/exercise.model';
import { Course } from 'app/entities/course.model';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';
import { JhiAlertService } from 'ng-jhipster';

chai.use(sinonChai);
const expect = chai.expect;
describe('ComplaintsComponent', () => {
    const teamComplaints = 42;
    const studentComplaints = 69;
    const course: Course = { maxTeamComplaints: teamComplaints, maxComplaints: studentComplaints };
    const exercise: Exercise = { id: 1, teamMode: false } as Exercise;
    const courseExercise: Exercise = { id: 1, teamMode: false, course } as Exercise;
    const courseTeamExercise: Exercise = { id: 1, teamMode: true, course } as Exercise;
    let component: ComplaintsFormComponent;
    let fixture: ComponentFixture<ComplaintsFormComponent>;
    let complaintService: ComplaintService;
    let jhiAlertService: JhiAlertService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ArtemisTestModule, ArtemisSharedModule, MomentModule],
            declarations: [ComplaintsFormComponent],
            providers: [
                MockProvider(JhiAlertService),
                {
                    provide: ComplaintService,
                    useClass: MockComplaintService,
                },
            ],
        })
            .overrideModule(ArtemisTestModule, { set: { declarations: [], exports: [] } })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(ComplaintsFormComponent);
                complaintService = TestBed.inject(ComplaintService);
                jhiAlertService = TestBed.inject(JhiAlertService);
                component = fixture.componentInstance;
                component.exercise = exercise;
            });
    }));

    it('should initialize with correct values for exam complaints', fakeAsync(() => {
        component.exercise = exercise;
        fixture.detectChanges();
        tick(100);
        expect(component.maxComplaintsPerCourse).to.be.eq(1);
    }));

    it('should initialize with correct values for course complaints', fakeAsync(() => {
        component.exercise = courseExercise;
        fixture.detectChanges();
        tick(100);
        expect(component.maxComplaintsPerCourse).to.be.eq(studentComplaints);
    }));

    it('should initialize with correct values for course complaints', fakeAsync(() => {
        component.exercise = courseTeamExercise;
        fixture.detectChanges();
        tick(100);
        expect(component.maxComplaintsPerCourse).to.be.eq(teamComplaints);
    }));

    it('should submit after complaint creation', () => {
        const createStub = sinon.stub(complaintService, 'create').returns(of({} as EntityResponseType));
        const submitSpy = sinon.spy(component.submit, 'emit');
        component.createComplaint();
        expect(createStub).to.have.been.calledOnce;
        expect(submitSpy).to.have.been.calledOnceWith();
    });

    it('should throw unknown error after complaint creation', () => {
        const createStub = sinon.stub(complaintService, 'create').returns(throwError({ status: 500 }));
        const submitSpy = sinon.spy(component.submit, 'emit');
        const errorSpy = sinon.spy(jhiAlertService, 'error');
        component.createComplaint();
        expect(createStub).to.have.been.calledOnce;
        expect(submitSpy).to.have.not.been.called;
        expect(errorSpy).to.have.been.calledOnce;
    });

    it('should throw known error after complaint creation', () => {
        const error = { error: { errorKey: 'toomanycomplaints' } } as HttpErrorResponse;
        const createStub = sinon.stub(complaintService, 'create').returns(throwError(error));
        const submitSpy = sinon.spy(component.submit, 'emit');
        const errorSpy = sinon.spy(jhiAlertService, 'error');
        const numberOfComplaints = 42;
        component.maxComplaintsPerCourse = numberOfComplaints;
        component.createComplaint();
        expect(createStub).to.have.been.calledOnce;
        expect(submitSpy).to.have.not.been.called;
        expect(errorSpy).to.have.been.calledOnceWith('artemisApp.complaint.tooManyComplaints', { maxComplaintNumber: numberOfComplaints });
    });
});
