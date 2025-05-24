/**
 * MSW Mock Implementation
 * 
 * This file provides mock implementations for MSW (Mock Service Worker) functionality
 * to avoid having to install the actual package.
 */

export type ResponseResolver<T = any> = (
  req: Request,
  res: ResponseComposer,
  ctx: ResponseTransformer
) => T;

export interface ResponseComposer {
  (statusCode: number, body?: any): Response;
  json: (body: any) => Response;
  text: (body: string) => Response;
  status: (statusCode: number) => Response;
}

export interface ResponseTransformer {
  status: (statusCode: number) => ResponseTransformer;
  json: (body: any) => ResponseTransformer;
  text: (body: string) => ResponseTransformer;
  delay: (ms: number) => ResponseTransformer;
}

export const rest = {
  get: (url: string, resolver: ResponseResolver) => ({
    type: 'GET',
    url,
    resolver
  }),
  post: (url: string, resolver: ResponseResolver) => ({
    type: 'POST',
    url,
    resolver
  }),
  put: (url: string, resolver: ResponseResolver) => ({
    type: 'PUT',
    url,
    resolver
  }),
  patch: (url: string, resolver: ResponseResolver) => ({
    type: 'PATCH',
    url,
    resolver
  }),
  delete: (url: string, resolver: ResponseResolver) => ({
    type: 'DELETE',
    url,
    resolver
  }),
};

// Mock setupServer function
export const setupServer = (...handlers: any[]) => {
  return {
    listen: () => {
      console.log('MSW mock server started');
      return () => {};
    },
    close: () => {
      console.log('MSW mock server closed');
    },
    resetHandlers: (...handlers: any[]) => {
      console.log('MSW mock server handlers reset');
    },
    use: (...handlers: any[]) => {
      console.log('MSW mock server handlers added');
    },
  };
};
