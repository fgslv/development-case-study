/**
 * Describes the data as it is received from the backend.
 */
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

/**
 * Describes the data as it is processed by the app.
 * Data of type IStudy is converted to an array of IForecast.
 * Each IForecast has a property name (the key) and a data property,
 * which is composed of an array of objects with a date and a value (IDataPair).
 */
export interface IForecast {
    name: string,
    data: IDataPair[],
}

/**
 * Describes the object of date and value used by IForecast.
 */
export interface IDataPair {
    value: Number,
    date: Date
}
