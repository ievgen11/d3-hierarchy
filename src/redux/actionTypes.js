import { createActionType, createPromiseTypes } from "./lib";

export const GET_DATA = createPromiseTypes([], "GET_DATA");
export const CLEAR_DATA = createActionType([], "CLEAR_DATA");
export const SET_SELECTED_VALUE = createActionType([], "SET_SELECTED_VALUE");
export const RESET_SELECTED_VALUE = createActionType([], "RESET_SELECTED_VALUE");