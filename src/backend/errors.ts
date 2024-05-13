export const DOMAIN_ERROR = '_api';
export type ErrorConstant = { status: number; _source: typeof DOMAIN_ERROR; error: string | object; };

const FailedValidation = (err: string): ErrorConstant => ({
    _source: DOMAIN_ERROR,
    status: 422,
    error: err
});

const Unauthenticated: ErrorConstant = {
    _source: DOMAIN_ERROR,
    status: 403,
    error: 'Unauthenticated',
};

const NotFoundOrNoDiscoveryForbidden: ErrorConstant = {
    _source: DOMAIN_ERROR,
    status: 404,
    error: 'Not Found',
};

export const errors = {
    FailedValidation,
    Unauthenticated,
    NotFoundOrNoDiscoveryForbidden,
};
