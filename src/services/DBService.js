import * as firebase from 'firebase';

import { FIREBASE_CONFIG } from '../config';

let _dbService;

class DBService {
    constructor() {
        firebase.initializeApp(FIREBASE_CONFIG);

        this.db = firebase.firestore();
    }

    getData() {
        return new Promise(resolve =>
            this.db
                .collection('geo-hierarchy')
                .get()
                .then(res => resolve(res.docs.map(doc => doc.data())))
        );
    }

    generateData() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    children: [
                        {
                            children: [],
                            id: '2',
                            name: 'Two',
                        },
                        {
                            children: [
                                {
                                    children: [],
                                    id: '4',
                                    name: 'Four',
                                },
                                {
                                    children: [],
                                    id: '5',
                                    name: 'Five',
                                }
                            ],
                            id: '3',
                            name: 'Three',
                        }
                    ],
                    id: '1',
                    name: 'One'
                });
            }, 1000);
        });
    }
}

_dbService = new DBService();
export default _dbService;
