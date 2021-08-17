import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import * as d3 from 'd3';

import { StudyService } from "../study.service";
import { IForecast, IDataPair } from '../study.model';


@Component({
    selector: 'app-forecast-list',
    templateUrl: './forecast-list.component.html',
})
export class ForecastListComponent implements OnInit, OnDestroy {
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

                this.addSvg();
                this.addAxis();
                this.addGraphs();
            });
    }

    ngOnDestroy() {
        this.studySub.unsubscribe();
    }

    private addSvg(): void {
        this.svg = d3.select("#forecasts_viz")
            .append("svg")
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

        const allGroup = this.study.map((f: IForecast) => f.name);
        const myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(d3.schemeSet2);

        // Lines
        var line = d3.line()
            .x((d: any) => x(+d.date))
            .y((d: any) => y(+d.value))

        this.svg.selectAll("myLines")
            .data(this.study)
            .enter()
            .append("path")
            .attr("d", (d: any) => line(d.data))
            .attr("stroke", (d: IForecast) => myColor(d.name))
            .style("stroke-width", 4)
            .style("fill", "none")

        // Add the points
        this.svg
            // First we need to enter in a group
            .selectAll("myDots")
            .data(this.study)
            .join('g')
            .style("fill", (d: IForecast) => myColor(d.name))
            // Second we need to enter in the 'values' part of this group
            .selectAll("myPoints")
            .data((d: IForecast) => d.data)
            .join("circle")
            .attr("cx", (d: any) => x(d.date))
            .attr("cy", (d: any) => y(d.value))
            .attr("r", 5)
            .attr("stroke", "white")

        // Add a legend at the end of each line
        this.svg
            .selectAll("myLabels")
            .data(this.study)
            .join('g')
            .append("text")
            .datum((d: IForecast) => { return { name: d.name, data: d.data[d.data.length - 1] }; }) // keep only the last value of each time series
            .attr("transform", (d: any) => `translate(${x(d.data.date)},${y(d.data.value)})`) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text((d: IForecast) => d.name)
            .style("fill", (d: any) => myColor(d.name))
            .style("font-size", 15)
    }
}