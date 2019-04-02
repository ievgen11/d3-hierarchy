import * as firebase from 'firebase';

import { FIREBASE_CONFIG } from "../config";

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
}

_dbService = new DBService();
export default _dbService;
