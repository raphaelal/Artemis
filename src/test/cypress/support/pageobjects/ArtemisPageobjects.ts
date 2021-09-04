import { ProgrammingExerciseCreationPage } from './ProgrammingExerciseCreationPage';
import { ExamManagementPage } from './ExamManagementPage';
import { ExamCreationPage } from './ExamCreationPage';
import { CourseManagementPage } from './CourseManagementPage';
import { NavigationBar } from './NavigationBar';
import { OnlineEditorPage } from './OnlineEditorPage';
import { CreateModelingExercisePage } from './CreateModelingExercisePage';
import { ModelingExerciseAssessmentEditor } from './ModelingExerciseAssessmentEditor';
import { ModelingEditor } from './ModelingEditor';
import { ExamStartEndPage } from './ExamStartEndPage';
import { QuizExerciseCreationPage } from './QuizExerciseCreationPage';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { ShortAnswerQuiz } from './ShortAnswerQuiz';
import { DragAndDropQuiz } from './DragAndDropQuiz';

/**
 * A class which encapsulates all pageobjects, which can be used to automate the Artemis UI.
 */
export class ArtemisPageobjects {
    courseManagement = new CourseManagementPage();
    navigationBar = new NavigationBar();
    onlineEditor = new OnlineEditorPage();
    examCreation = new ExamCreationPage();
    examManagement = new ExamManagementPage();
    programmingExerciseCreation = new ProgrammingExerciseCreationPage();
    createModelingExercise = new CreateModelingExercisePage();
    modelingExerciseAssessmentEditor = new ModelingExerciseAssessmentEditor();
    modelingEditor = new ModelingEditor();
    examStartEnd = new ExamStartEndPage();
    quizExerciseCreation = new QuizExerciseCreationPage();
    multipleChoiceQuiz = new MultipleChoiceQuiz();
    shortAnswerQuiz = new ShortAnswerQuiz();
    dragAndDropQuiz = new DragAndDropQuiz();
}
