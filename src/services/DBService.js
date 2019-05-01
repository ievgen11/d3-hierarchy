import { commerce } from 'faker';

let _dbService;

class DBService {
    generateData() {
        return new Promise(resolve => {
            setTimeout(() => {
                const ids = Array.from(Array(40).keys());

                function getNestedChildren(arr, parent = 0) {
                    const result = [];

                    for (var i in arr) {
                        if (arr[i].parent === parent) {
                            result.push({
                                id: arr[i].id,
                                name: arr[i].name,
                                children:
                                    getNestedChildren(arr, arr[i].id) || []
                            });
                        }
                    }

                    return result;
                }

                resolve(
                    getNestedChildren(
                        Array.from({ length: ids.length }, () => {
                            const id = ids.pop();
                            const name = commerce.productName();

                            if (id === 0) {
                                return {
                                    id,
                                    name: 'root'
                                };
                            }

                            if (id === 1) {
                                return {
                                    id,
                                    name,
                                    parent: 0
                                };
                            }

                            return {
                                id,
                                name,
                                parent: Math.floor(Math.random() * 10) + 1
                            };
                        })
                    )[0]
                );
            }, 1000);
        });
    }
}

_dbService = new DBService();
export default _dbService;
