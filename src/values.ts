export interface MetricValue {
    name: string;
    description: string;
    maxValue?: number;
    actualValue: number;
    level?: number;
}