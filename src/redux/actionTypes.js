import { createActionType, createPromiseTypes } from "./lib";

export const GET_DATA = createPromiseTypes([], "GET_DATA");
export const CLEAR_DATA = createActionType([], "CLEAR_DATA");
