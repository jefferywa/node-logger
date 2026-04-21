import {
  HEADER_AUTHORIZATION_PATTERN,
  HEADER_REPLACE_PATTERN,
  HEADER_RM_REGEX,
  HEADER_SID_REGEX,
} from './constants';
import { MiddlewareRequestInterface } from './interfaces/middleware.interface';

export function createSerializers() {
  const header = (headers: Record<string, string | string[] | undefined>) => {
    const headerList = { ...headers };

    if (headerList.cookie) {
      const cookieValue = Array.isArray(headerList.cookie)
        ? headerList.cookie.join(';')
        : headerList.cookie;
      headerList.cookie = cookieValue
        .replace(HEADER_SID_REGEX, HEADER_REPLACE_PATTERN)
        .replace(HEADER_RM_REGEX, HEADER_REPLACE_PATTERN);
    }

    if (headerList.authorization) {
      headerList.authorization = HEADER_AUTHORIZATION_PATTERN;
    }

    return headerList;
  };

  return {
    header,
    req: (request: MiddlewareRequestInterface) => {
      return {
        url: request.url,
        method: request.method,
        headers: header(request.headers),
      };
    },
    err: (err: Error) => {
      return {
        name: err.name,
        message: JSON.stringify(err.message),
        stack: err.stack,
      };
    },
  };
}
