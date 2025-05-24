/**
 * Type declarations for Redux Toolkit Query
 * Fixes "Untyped function calls may not accept type arguments" errors
 */

declare module '@reduxjs/toolkit/query/react' {
  import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
  
  export interface FetchBaseQueryArgs {
    baseUrl?: string;
    prepareHeaders?: (headers: Headers, api: { getState: () => unknown }) => Headers;
    credentials?: RequestCredentials;
  }

  export function fetchBaseQuery(args: FetchBaseQueryArgs): BaseQueryFn;

  export interface CreateApiOptions<ReducerPath extends string = string> {
    reducerPath: ReducerPath;
    baseQuery: BaseQueryFn;
    tagTypes?: string[];
    endpoints: (builder: EndpointBuilder<any, any, any>) => any;
  }

  export function createApi<Options extends CreateApiOptions>(
    options: Options
  ): any;

  export interface EndpointBuilder<BaseQuery, TagTypes extends string, ReducerPath extends string> {
    query<ResultType, QueryArg>(
      options: {
        query: (arg: QueryArg) => any;
        providesTags?: (result: ResultType, error: any, arg: QueryArg) => Array<{ type: TagTypes; id?: string | number }>;
      }
    ): any;
    
    mutation<ResultType, QueryArg>(
      options: {
        query: (arg: QueryArg) => any;
        invalidatesTags?: Array<TagTypes> | ((result: ResultType, error: any, arg: QueryArg) => Array<{ type: TagTypes; id?: string | number }>);
      }
    ): any;
  }
}
