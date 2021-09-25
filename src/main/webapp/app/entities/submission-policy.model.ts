import { ProgrammingExercise } from 'app/entities/programming-exercise.model';
import { BaseEntity } from 'app/shared/model/base-entity';

export enum SubmissionPolicyType {
    NONE = 'none',
    LOCK_REPOSITORY = 'lock_repository',
    SUBMISSION_PENALTY = 'submission_penalty',
}

export abstract class SubmissionPolicy implements BaseEntity {
    public id?: number;

    public programmingExercise?: ProgrammingExercise;
    public active?: boolean;
    public submissionLimit?: number;
    public type?: SubmissionPolicyType;

    protected constructor(type: SubmissionPolicyType) {
        this.type = type;
    }
}

export class LockRepositoryPolicy extends SubmissionPolicy {
    constructor() {
        super(SubmissionPolicyType.LOCK_REPOSITORY);
    }
}

export class SubmissionPenaltyPolicy extends SubmissionPolicy {
    public exceedingPenalty?: number;

    constructor() {
        super(SubmissionPolicyType.SUBMISSION_PENALTY);
    }
}
