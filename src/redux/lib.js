const SEP = "/";

export const createActionType = (context = [], actionType = "", sep = SEP) =>
    [...context.map(d => d), actionType.toUpperCase()].join(sep);

export const createPromiseTypes = (context = [], actionType = "", sep) => {
    const type = createActionType(context, actionType, sep);

    return {
        TYPE: `${type}`,
        PENDING: `${type}_PENDING`,
        REJECTED: `${type}_REJECTED`,
        FULFILLED: `${type}_FULFILLED`
    };
};
