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
                            name: 'Two',
                        },
                        {
                            children: [
                                {
                                    children: [],
                                    name: 'Four',
                                },
                                {
                                    children: [],
                                    name: 'Five',
                                }
                            ],
                            name: 'Three',
                        }
                    ],
                    name: 'One'
                });
            }, 1000);
        });
    }
}

_dbService = new DBService();
export default _dbService;
