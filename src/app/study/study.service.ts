import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IStudy, IForecast } from './study.model';
import { of } from 'rxjs';

/**
 * The service that fetches data from the backend,
 * prepares it and forwards it to subscribers.
 */
@Injectable({ providedIn: 'root' })
export class StudyService {
  private url = 'http://localhost:3000/api/study';

  private studyUpdated = new Subject<IForecast[]>();

  constructor(private http: HttpClient) { }

  /**
   * Query study data via url and notify subscribers regarding new data.
   */
  getStudy(): void {
    this.http
      // The format of the response must correspond to IStudy
      .get<IStudy>(this.url)
      // Use dummy object if query fails
      .pipe(catchError((error) => {
          console.log(error.message);
          return of({
            forecast_one: {
              value: ['0.0'],
              date: ['1970-01-01']
            },
            forecast_two: {
              value: ['0.0'],
              date: ['1970-01-01']
            },
            forecast_three: {
              value: ['0.0'],
              date: ['1970-01-01']
            }
          })
        }))
        // Convert data into the forecast format
        .pipe(map((studyData) => {
        const forecasts: IForecast[] = [];

        Object.keys(studyData)
          .forEach((key: string) => {
            forecasts.push(this.generateForecast(
              key,
              studyData[key as keyof IStudy].date,
              studyData[key as keyof IStudy].value
            ));
          });

        return forecasts;
      }))
      // Notify the subscribers
      .subscribe(
        (data) => this.studyUpdated.next(data),
        (error) => console.log(error)
      );
  }

  /**
   * Subscribe to this service
   */
  getStudyUpdatedListener() {
    return this.studyUpdated.asObservable();
  }

  /**
   * Create a forecast object and make sure the data is sorted in ascending order.
   */
  private generateForecast(key: string, dates: string[], values: string[]): IForecast {
    // Handle a difference the number of dates and values
    if (dates.length === 0
      || values.length === 0
      || dates.length !== values.length) {
      // return a dummy object
      return { name: 'Error: Unreadable', data: [ { date: new Date(), value: 0.0 }]}
    }
    // Create the forecast and make sure the dates are in ascending order.
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
}
