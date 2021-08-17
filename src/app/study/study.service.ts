import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IStudy, IForecast } from './study.model';

@Injectable({providedIn: 'root'})
export class StudyService {
    private url = 'http://localhost:3000/api/study'
    private studyUpdated = new Subject<IForecast[]>();

    constructor(private http: HttpClient) {}

    private generateForecast(key: string, dates: string[], values: string[]): IForecast {
        return {
            name: key,
            data: dates
                .map((d, i) => ({
                    date: new Date(d),
                    value: new Number(values[i])
                }))
                .sort((o1: any, o2: any) => o1.date < o2.date ? -1 : 1),
        }
    }

    getStudy(): void {
        this.http
        .get<IStudy>(this.url)
        .pipe(map((studyData) => {
            const forecasts: IForecast[] = [];

            Object.keys(studyData).map((key: string) => {
                forecasts.push(this.generateForecast(
                    key,
                    studyData[key as keyof IStudy].date,
                    studyData[key as keyof IStudy].value
                ));
            });
            return forecasts;
        }))
        .subscribe((data) => this.studyUpdated.next(data));
    }

    getStudyUpdatedListener() {
        return this.studyUpdated.asObservable();
    }
}