import { ScaFeedbackModal } from './exercises/programming/ScaFeedbackModal';
import { CodeAnalysisGradingPage } from './exercises/programming/CodeAnalysisGradingPage';
import { TextEditorPage } from './exercises/text/TextEditorPage';
import { ExamNavigationBar } from './exam/ExamNavigationBar';
import { CourseOverviewPage } from './course/CourseOverviewPage';
import { CoursesPage } from './course/CoursesPage';
import { CourseManagementExercisesPage } from './CourseManagementExercisesPage';
import { ProgrammingExerciseCreationPage } from './ProgrammingExerciseCreationPage';
import { ExamManagementPage } from './exam/ExamManagementPage';
import { ExamCreationPage } from './exam/ExamCreationPage';
import { CourseManagementPage } from './course/CourseManagementPage';
import { NavigationBar } from './NavigationBar';
import { OnlineEditorPage } from './OnlineEditorPage';
import { CreateModelingExercisePage } from './CreateModelingExercisePage';
import { ModelingExerciseAssessmentEditor } from './ModelingExerciseAssessmentEditor';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { ModelingEditor } from './ModelingEditor';
import { AssessmentDashboard } from './AssessmentDashboard';
import { ExamStartEndPage } from './exam/ExamStartEndPage';
import { QuizExerciseCreationPage } from './QuizExerciseCreationPage';
import { TextExerciseCreationPage } from './exercises/text/TextExerciseCreationPage';
import { TextExerciseExampleSubmissionsPage } from './exercises/text/TextExerciseExampleSubmissionsPage';
import { TextExerciseExampleSubmissionCreationPage } from './exercises/text/TextExerciseExampleSubmissionCreationPage';

/**
 * A class which encapsulates all pageobjects, which can be used to automate the Artemis UI.
 */
export class ArtemisPageobjects {
    courseManagement = new CourseManagementPage();
    courses = new CoursesPage();
    courseOverview = new CourseOverviewPage();
    courseManagementExercises = new CourseManagementExercisesPage();
    navigationBar = new NavigationBar();
    examCreation = new ExamCreationPage();
    examManagement = new ExamManagementPage();
    examStartEnd = new ExamStartEndPage();
    examNavigationBar = new ExamNavigationBar();
    assessmentDashboard = new AssessmentDashboard();
    programmingExercise = {
        editor: new OnlineEditorPage(),
        creation: new ProgrammingExerciseCreationPage(),
        scaConfiguration: new CodeAnalysisGradingPage(),
        scaFeedback: new ScaFeedbackModal(),
    };
    textExercise = {
        creation: new TextExerciseCreationPage(),
        exampleSubmissions: new TextExerciseExampleSubmissionsPage(),
        exampleSubmissionCreation: new TextExerciseExampleSubmissionCreationPage(),
        editor: new TextEditorPage(),
    };
    modelingExercise = {
        creation: new CreateModelingExercisePage(),
        assessmentEditor: new ModelingExerciseAssessmentEditor(),
        editor: new ModelingEditor(),
    };
    quizExercise = {
        creation: new QuizExerciseCreationPage(),
        multipleChoice: new MultipleChoiceQuiz(),
    };
}
