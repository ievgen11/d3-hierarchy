export const getData = store => store.data.get("data");
export const getDataIsPending = store => store.data.get("isPending");
export const getDataIsError = store => store.data.get("isError");
export const getDataIsExpanded = store => store.data.get("isExpanded");
export const getSearchQuery = store => store.search.get("searchQuery");

export default {
    getData,
    getDataIsError,
    getDataIsPending,
    getSearchQuery,
    getDataIsExpanded
};
