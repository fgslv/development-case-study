import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
// import { ScatterComponent } from './scatter/scatter.component';
import { ForecastListComponent } from './study/forecast-list/forecast-list.component';


@NgModule({
  declarations: [
    AppComponent,
//    ScatterComponent,
    ForecastListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
