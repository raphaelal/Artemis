import { Moment } from 'moment';
import { BaseEntity } from 'app/shared/model/base-entity';
import { FeedbackType } from 'app/entities/feedback.model';
import { TextBlockType } from 'app/entities/text-block.model';

export enum TextAssessmentEventType {
    ADD_FEEDBACK_AUTOMATICALLY_SELECTED_BLOCK = 'ADD_FEEDBACK_AUTOMATICALLY_SELECTED_BLOCK',
    ADD_FEEDBACK_MANUALLY_SELECTED_BLOCK = 'ADD_FEEDBACK_MANUALLY_SELECTED_BLOCK',
    CLICK_TO_RESOLVE_CONFLICT = 'CLICK_TO_RESOLVE_CONFLICT',
    HOVER_OVER_IMPACT_WARNING = 'HOVER_OVER_IMPACT_WARNING',
    VIEW_AUTOMATIC_SUGGESTION_ORIGIN = 'VIEW_AUTOMATIC_SUGGESTION_ORIGIN',
    DELETE_FEEDBACK = 'DELETE_FEEDBACK',
    EDIT_AUTOMATIC_FEEDBACK = 'EDIT_AUTOMATIC_FEEDBACK',
    SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT',
    ASSESS_NEXT_SUBMISSION = 'ASSESS_NEXT_SUBMISSION',
}

export class TextAssessmentEvent implements BaseEntity {
    public id?: number;
    public userId?: number;
    public timestamp?: Moment;
    public eventType?: TextAssessmentEventType;
    public feedbackType?: FeedbackType;
    public segmentType?: TextBlockType;
    public courseId?: number;
    public textExerciseId?: number;
    public participationId?: number;
    public submissionId?: number;

    constructor(userId?: number, courseId?: number, textExerciseId?: number, participationId?: number, submissionId?: number) {
        this.userId = userId;
        this.courseId = courseId;
        this.textExerciseId = textExerciseId;
        this.participationId = participationId;
        this.submissionId = submissionId;
    }

    setEventType(type: TextAssessmentEventType) {
        this.eventType = type;
        return this;
    }

    setFeedbackType(type?: FeedbackType) {
        this.feedbackType = type;
    }

    setSegmentType(type?: TextBlockType) {
        this.segmentType = type;
    }
}
