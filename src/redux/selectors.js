export const getData = store => store.data.get("data");
export const getDataIsPending = store => store.data.get("isPending");
export const getDataIsError = store => store.data.get("isError");
export const getSelectedValue = store => store.selector.get("selectedValue");

export default {
    getData,
    getDataIsError,
    getDataIsPending,
    getSelectedValue
};
