import * as express from 'express'
import {Request, Response} from 'express'
import promRegistryFactory from './promRegistryFactory'

const register = promRegistryFactory()


import {start} from './handler'

const app = express();
const port = process.env.PORT || 3000;

// @ts-ignore
const rand = (low, high) => Math.random() * (high - low) + low;

// @ts-ignore
app.get('/metrics', (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
});

app.listen(port, () => {
    console.log(`Ready to test and collect metrics, listening on: ${port} port`)
});

setInterval(async () => {
    // @ts-ignore
    await start(process.env.ACCEPTANCE_TESTS_DIR, {})
}, 60000)
