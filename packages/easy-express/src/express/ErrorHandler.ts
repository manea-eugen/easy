import express from 'express';
import { isAuthError } from './AuthError';
import {
  asString,
  choose,
  ctx,
  Exception,
  HttpStatus,
  isError,
  isException,
  isResponse,
  isResults,
  isText,
  OriginatedError,
  Response,
  rest,
  Result,
  toHttpStatus,
  toOriginatedError,
  toResult,
  tryTo,
} from '@thisisagile/easy';

const toResponse = (status: HttpStatus, errors: Result[] = []): Response => ({
  status,
  body: rest.toError(status, errors),
});

const toBody = ({ origin, options }: OriginatedError): Response => {
  return choose<Response, any>(origin)
    .case(
      o => isAuthError(o),
      o => toResponse(toHttpStatus(o.status), [toResult(o.message)]),
    )
    .case(
      o => Exception.DoesNotExist.equals(o),
      (o: Exception) => toResponse(options?.onNotFound ?? HttpStatus.NotFound, [toResult(o.reason ?? o.message)]),
    )
      // This service breaks with an error
    .type(isError, e => toResponse(HttpStatus.InternalServerError, [toResult(e.message)]))
    // This service fails
    .type(isResults, r => toResponse(options?.onError ?? HttpStatus.BadRequest, r.results))
    // Underlying service fails
    .type(isResponse, r => toResponse(HttpStatus.InternalServerError, r.body.error?.errors))
    .case(
      o => isException(o),
      (o: Exception) => toResponse(options?.onError ?? HttpStatus.BadRequest, [toResult(o.reason ?? o.message)]),
    )
    .case(
      // This service fails with a string
      o => isText(o),
      (o: Response) => toResponse(options?.onError ?? HttpStatus.BadRequest, [toResult(asString(o))]),
    )
    .else(() => toResponse(HttpStatus.InternalServerError, [toResult('Unknown error')]));
};

export const error = (e: Error, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  tryTo(() => toOriginatedError(e))
    .map(oe => toBody(oe))
    .accept(r => (ctx.request.lastError = r.status.isServerError ? r.body.error?.errors[0]?.message : undefined))
    .accept(r => res.status(r.status.status).json(r.body))
    .recover(o => {
      console.error('ErrorHandler:', o);
      return res.status(HttpStatus.InternalServerError.status).json(toResponse(HttpStatus.InternalServerError, [toResult(HttpStatus.InternalServerError.name)]).body) as any;
    });
};
