export interface IStudy {
    forecast_one: {
        value: string[],
        date: string[],
    },
    forecast_two: {
        value: string[],
        date: string[],
    },
    forecast_three: {
        value: string[],
        date: string[],
    }
}

export interface IForecast {
    name: string,
    data: IDataPair[],
}

export interface IDataPair {
    value: Number,
    date: Date
}