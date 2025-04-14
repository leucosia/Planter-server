type ResultType = 'success' | 'error' | 'fail';

interface BaseResponse {
    result: ResultType;
}

interface SuccessResponse<T=any> extends BaseResponse {
    result: 'success';
    data: T;
}

interface FailResponse extends BaseResponse {
    result: 'fail';
    message: string;
}

interface ErrorResponse extends BaseResponse {
    result: 'error';
    message: string
}