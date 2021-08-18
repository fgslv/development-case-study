import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import * as d3 from 'd3';

import { StudyService } from "../study.service";
import { IForecast, IDataPair } from '../study.model';

/**
 * Visualizes the study as an d3 Connected Scatteredplot
 * Reference: https://www.d3-graph-gallery.com/connectedscatter.html
 */
@Component({
    selector: 'app-forecast-viz',
    templateUrl: './forecast-viz.component.html',
})
export class ForecastVizComponent implements OnInit, OnDestroy {
    @Input() study: IForecast[] = [];
    private studySub!: Subscription;

    private margin = {
        top: 10,
        right: 130,
        bottom: 30,
        left: 50
    };

    private width: number;
    private height: number;

    private x: any;
    private y: any;
    private svg: any;

    constructor(public studyService: StudyService) {
        this.width = 640 - this.margin.left - this.margin.right;
        this.height = 480 - this.margin.top - this.margin.bottom;
    }

    ngOnInit() {
      this.studyService.getStudy();
      this.studySub = this.studyService.getStudyUpdatedListener()
        .subscribe((study: IForecast[]) => {
          this.study = study;
          this.initSvg();
          this.addAxis();
          this.addGraphs();
        });
    }

    ngOnDestroy() {
        this.studySub.unsubscribe();
    }

    private initSvg(): void {
        this.svg = d3.select("#forecasts_viz")
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom)
          .append("g")
              .attr("transform",
                    "translate(" + this.margin.left + "," + this.margin.top + ")");
    }

    private addAxis(): void {
        const allPairs = this.study
          .map((f: IForecast) => f.data)
          .reduce((acc, val) => acc.concat(val), []);

        // X-Axis
        this.x = d3.scaleTime()
          .range([0, this.width]);
        this.x.domain(
          d3.extent(allPairs, (d: IDataPair) => d.date)
        );
        this.svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(this.x));

        // Y-Axis
        this.y = d3.scaleLinear()
          .range([this.height, 0]);
        this.y.domain(
          d3.extent(allPairs, (d: IDataPair) => d.value)
        );
        this.svg.append("g")
          .call(d3.axisLeft(this.y));
    }

    private addGraphs(): void {
        const x = this.x;
        const y = this.y;

        const graphNames = this.study.map((f: IForecast) => f.name);
        const graphColors = d3.scaleOrdinal()
          .domain(graphNames)
          .range(d3.schemeSet2);

        // Add lines
        var line = d3.line()
          .x((d: any) => x(+d.date))
          .y((d: any) => y(+d.value));

        this.svg
          .selectAll("graphLines")
          .data(this.study)
          .enter()
          .append("path")
          .attr("d", (d: any) => line(d.data))
          .attr("stroke", (d: IForecast) => graphColors(d.name))
          .style("stroke-width", 4)
          .style("fill", "none");

        // Add points
        this.svg
          .selectAll("graphDots")
          .data(this.study)
          .join('g')
          .style("fill", (d: IForecast) => graphColors(d.name))
          .selectAll("graphPoints")
          .data((d: IForecast) => d.data)
          .join("circle")
          .attr("cx", (d: IDataPair) => x(d.date))
          .attr("cy", (d: IDataPair) => y(d.value))
          .attr("r", 5)
          .attr("stroke", "white");

        // Add a legend at the end of each line
        this.svg
          .selectAll("graphLabels")
          .data(this.study)
          .join('g')
          .append("text")
          .datum((d: IForecast) => { return { name: d.name, data: d.data[d.data.length - 1] }; })
          .attr("transform", (d: any) => `translate(${x(d.data.date)},${y(d.data.value)})`)
          .attr("x", 12)
          .text((d: IForecast) => d.name)
          .style("fill", (d: IForecast) => graphColors(d.name))
          .style("font-size", 15);
    }
}
