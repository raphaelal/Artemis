import { Directive, Input } from '@angular/core';
import { Posting } from 'app/entities/metis/posting.model';

@Directive()
export abstract class PostingsFooterDirective<T extends Posting> {
    @Input() posting: T;
}
