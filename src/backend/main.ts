import express, { NextFunction, Request, Response } from 'express';
import { AppService } from './controller';
import cors from 'cors';
import { ApiErrorResponse, ApiSuccessResponse } from '../models/shared';
import { logFunction } from '../utils';
import { DOMAIN_ERROR, ErrorConstant, errors } from './errors';

const PORT = process.env.PORT || 8000;

const app_service = new AppService();

const loadGuildVault = async (req: Request, res: Response, next: NextFunction) => {
    logFunction(loadGuildVault, '/guild_vault/:realm_slug/:guild_slug')
    try {
        const { realm_slug, guild_slug } = req.params;
        const response = await app_service.loadGuildVault(realm_slug, guild_slug);
        res.send(response);
    } catch (err) {
        next(err);
    }
};

const errorMiddleware = (error: Error | ErrorConstant, req: Request, res: Response, next: NextFunction): void => {
    if (typeof error === 'object' && "_source" in error && error._source === DOMAIN_ERROR) {
        logFunction(errorMiddleware, { error });
        res.status(error.status).send(error.error);
        return;
    }

    const internalError = { error: error.toString(), stack: (error as Error).stack }
    logFunction(errorMiddleware, internalError);
    res.status(500).send("Internal Server Error");
};

function api(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    (res.send as any) = function (this: ThisType<{}>, data: any) {
        res.send = originalSend;
        console.log(JSON.stringify({
            tag: "API",
            method: req.method,
            path: req.path,
            status: res.statusCode,
        }));
        if (res.statusCode >= 500) {
            const responseStructure: ApiErrorResponse = {
                meta: {
                    status: res.statusCode,
                    version: 'dev',
                },
                error: "Internal Server Error",
            };
            originalSend.call(this, responseStructure);
        } else if (res.statusCode >= 400) {
            const responseStructure: ApiErrorResponse = {
                meta: {
                    status: res.statusCode,
                    version: 'dev',
                    ...(Array.isArray(data) ? { count: data.length } : {})
                },
                error: data,
            };
            originalSend.call(this, responseStructure);
        } else {
            const responseStructure: ApiSuccessResponse<any> = {
                meta: {
                    status: res.statusCode,
                    version: 'dev',
                    ...(Array.isArray(data) ? { count: data.length } : {})
                },
                data: data,
            };
            originalSend.call(this, responseStructure);
        }
    };
    next();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(api);
app.get('/guild_vault/:realm_slug/:guild_slug', loadGuildVault);
app.get('/elb-status', (req, res, next) => {
    res.status(200).send('OK')
});
app.get('*', function (req, res, next) {
    next(errors.NotFoundOrNoDiscoveryForbidden);
});
app.use(errorMiddleware);

const startServer = () => {
    logFunction(startServer, `⚡️[server]: Server is runnaing at http://localhost:${PORT}`);
};
app.listen(PORT, startServer);

