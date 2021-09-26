import { Component, Input, OnInit } from '@angular/core';
import { Exercise, ExerciseType } from 'app/entities/exercise.model';
import { Subject } from 'rxjs';
import { TextExerciseService } from 'app/exercises/text/manage/text-exercise/text-exercise.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploadExerciseService } from 'app/exercises/file-upload/manage/file-upload-exercise.service';
import { ModelingExerciseService } from 'app/exercises/modeling/manage/modeling-exercise.service';
import { Course } from 'app/entities/course.model';
import { Router } from '@angular/router';
import { EventManager } from 'app/core/util/event-manager.service';

@Component({
    selector: 'jhi-non-programming-exercise-detail-common-actions',
    templateUrl: './non-programming-exercise-detail-common-actions.component.html',
})
export class NonProgrammingExerciseDetailCommonActionsComponent implements OnInit {
    @Input()
    exercise: Exercise;

    @Input()
    course: Course;

    @Input()
    isExamExercise = false;

    dialogErrorSource = new Subject<string>();
    dialogError$ = this.dialogErrorSource.asObservable();
    baseResource: string;
    shortBaseResource: string;
    readonly ExerciseType = ExerciseType;

    constructor(
        private textExerciseService: TextExerciseService,
        private fileUploadExerciseService: FileUploadExerciseService,
        private modelingExerciseService: ModelingExerciseService,
        private eventManager: EventManager,
        private router: Router,
    ) {}

    ngOnInit(): void {
        if (!this.isExamExercise) {
            this.baseResource = `/course-management/${this.course.id!}/${this.exercise.type}-exercises/${this.exercise.id}/`;
            this.shortBaseResource = `/course-management/${this.course.id!}/`;
        } else {
            this.baseResource =
                `/course-management/${this.course.id!}/exams/${this.exercise.exerciseGroup?.exam?.id}` +
                `/exercise-groups/${this.exercise.exerciseGroup?.id}/${this.exercise.type}-exercises/${this.exercise.id}/`;
            this.shortBaseResource = `/course-management/${this.course.id!}/exams/${this.exercise.exerciseGroup?.exam?.id}/`;
        }
    }

    deleteExercise() {
        switch (this.exercise.type) {
            case ExerciseType.TEXT:
                this.textExerciseService.delete(this.exercise.id!).subscribe(
                    () => {
                        this.eventManager.broadcast({
                            name: 'textExerciseListModification',
                            content: 'Deleted a textExercise',
                        });
                        this.dialogErrorSource.next('');
                        this.navigateToOverview();
                    },
                    (error: HttpErrorResponse) => this.dialogErrorSource.next(error.message),
                );
                break;
            case ExerciseType.FILE_UPLOAD:
                this.fileUploadExerciseService.delete(this.exercise.id!).subscribe(
                    () => {
                        this.eventManager.broadcast({
                            name: 'fileUploadExerciseListModification',
                            content: 'Deleted an fileUploadExercise',
                        });
                        this.dialogErrorSource.next('');
                        this.navigateToOverview();
                    },
                    (error: HttpErrorResponse) => this.dialogErrorSource.next(error.message),
                );
                break;
            case ExerciseType.MODELING:
                this.modelingExerciseService.delete(this.exercise.id!).subscribe(
                    () => {
                        this.eventManager.broadcast({
                            name: 'modelingExerciseListModification',
                            content: 'Deleted an modelingExercise',
                        });
                        this.dialogErrorSource.next('');
                        this.navigateToOverview();
                    },
                    (error: HttpErrorResponse) => this.dialogErrorSource.next(error.message),
                );
                break;
            default:
        }
    }

    /**
     * Navigates back to the exercises list
     */
    private navigateToOverview() {
        if (!this.isExamExercise) {
            this.router.navigateByUrl(`/course-management/${this.course.id}/exercises`);
        } else {
            this.router.navigateByUrl(`/course-management/${this.course.id}/exams/${this.exercise.exerciseGroup?.exam?.id}/exercise-groups`);
        }
    }
}
