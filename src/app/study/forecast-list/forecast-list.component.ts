import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { StudyService } from "../study.service";
import { IForecast } from '../study.model';

/**
 * Display the forecast data as provided by the study.service.component
 */
@Component({
    selector: 'app-forecast-list',
    templateUrl: './forecast-list.component.html',
    styleUrls: ['./forecast-list.component.css']
})
export class ForecastListComponent implements OnInit, OnDestroy {
    @Input() study: IForecast[] = [];
    private studySub!: Subscription;

    displayedColumns: string[] = ['date', 'value'];

    constructor(public studyService: StudyService) {}

    ngOnInit() {
      this.studyService.getStudy();

      this.studySub = this.studyService.getStudyUpdatedListener()
        .subscribe((study: IForecast[]) => {
            this.study = study;
        });
    }

    ngOnDestroy() {
        this.studySub.unsubscribe();
    }
}
