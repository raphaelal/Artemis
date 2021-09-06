import { Component, OnInit } from '@angular/core';
import { PageableSearch, SearchResult, SortingOrder } from 'app/shared/table/pageable-table';
import { SortService } from 'app/shared/service/sort.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Submission } from 'app/entities/submission.model';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ExampleSubmissionService } from 'app/exercises/shared/example-submission/example-submission.service';
import { onError } from 'app/shared/util/global.utils';
import { JhiAlertService } from 'ng-jhipster';
import { HttpErrorResponse } from '@angular/common/http';
import { Exercise } from 'app/entities/exercise.model';
import { ExampleSubmissionImportPagingService } from 'app/exercises/shared/example-submission/example-submission-import/example-submission-import-paging.service';

enum TableColumn {
    ID = 'ID',
    STUDENT_NAME = 'STUDENT_NAME',
    SUBMISSION_DATE = 'SUBMISSION_DATE',
}

@Component({
    selector: 'jhi-example-submission-import',
    templateUrl: './example-submission-import.component.html',
})
export class ExampleSubmissionImportComponent implements OnInit {
    exercise: Exercise;
    readonly column = TableColumn;

    private search = new Subject<void>();
    private sort = new Subject<void>();

    submissions: Submission[] = [];

    loading = false;
    content: SearchResult<Submission>;
    total = 0;
    state: PageableSearch = {
        page: 0,
        pageSize: 10,
        searchTerm: '',
        sortingOrder: SortingOrder.DESCENDING,
        sortedColumn: TableColumn.ID,
    };

    constructor(
        private sortService: SortService,
        private activeModal: NgbActiveModal,
        protected jhiAlertService: JhiAlertService,
        private exampleSubmissionService: ExampleSubmissionService,
        private pagingService: ExampleSubmissionImportPagingService,
    ) {}

    ngOnInit(): void {
        this.content = { resultsOnPage: [], numberOfPages: 0 };

        this.performSearch(this.sort, 0);
        this.performSearch(this.search, 300);
    }

    private performSearch(searchSubject: Subject<void>, debounce: number) {
        searchSubject
            .pipe(
                debounceTime(debounce),
                tap(() => (this.loading = true)),
                switchMap(() => this.pagingService.searchForSubmissions(this.state, this.exercise.id!)),
            )
            .subscribe((resp) => {
                this.content = resp;
                this.loading = false;
                this.total = resp.numberOfPages * this.state.pageSize;
            });
    }

    /**
     * Closes the modal in which the import component is opened by dismissing it
     */
    clear() {
        this.activeModal.dismiss('cancel');
    }

    /**
     * Closes the modal in which the import component is opened. Gives the selected submission as a result.
     *
     * @param submission The submission which was selected by the user for the import.
     */
    openImport(submission: Submission) {
        this.activeModal.close(submission);
    }

    set page(page: number) {
        this.setSearchParam({ page });
    }

    get page(): number {
        return this.state.page;
    }

    sortRows() {
        this.sortService.sortByProperty(this.content.resultsOnPage, this.sortedColumn, this.listSorting);
    }

    private setSearchParam(patch: Partial<PageableSearch>) {
        Object.assign(this.state, patch);
        this.sort.next();
    }

    set sortedColumn(sortedColumn: string) {
        this.setSearchParam({ sortedColumn });
    }

    get sortedColumn(): string {
        return this.state.sortedColumn;
    }

    /** Set the list sorting direction
     *
     * @param ascending {boolean} Ascending order set
     */
    set listSorting(ascending: boolean) {
        const sortingOrder = ascending ? SortingOrder.ASCENDING : SortingOrder.DESCENDING;
        this.setSearchParam({ sortingOrder });
    }

    get listSorting(): boolean {
        return this.state.sortingOrder === SortingOrder.ASCENDING;
    }

    set searchTerm(searchTerm: string) {
        this.state.searchTerm = searchTerm;
        this.search.next();
    }

    get searchTerm(): string {
        return this.state.searchTerm;
    }

    /** Callback function when the user navigates through the page results
     *
     * @param pagenumber The current page number
     */
    onPageChange(pagenumber: number) {
        if (pagenumber) {
            this.page = pagenumber;
        }
    }
}
