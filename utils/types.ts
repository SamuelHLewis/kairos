export enum taskState {
    notStarted,
    inProgress,
    done
}

export enum taskPriority {
    low,
    high
}

export interface taskEntry {
    Name: string,
    Description: string,
    Due: Date,
    Priority: taskPriority,
    State: taskState
}
