import {Registry} from "prom-client";


const client = require('prom-client');
let register: Registry;

export default (): Registry => {
    if (!register) {
        console.log('going to create new ')
        register = new client.Registry();
    }else {
        console.log('us existing reg to create new ')
    }
    return register;
}