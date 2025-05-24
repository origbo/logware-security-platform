/**
 * Type declarations for Redux Toolkit Query
 * This file provides type definitions for RTK Query to resolve "Untyped function calls may not accept type arguments" errors
 */

declare module '@reduxjs/toolkit/query/react' {
  import { BaseQueryFn } from '@reduxjs/toolkit/query';

  export interface FetchBaseQueryArgs {
    baseUrl: string;
    prepareHeaders?: (headers: Headers, api: { getState: () => unknown }) => Headers;
    credentials?: RequestCredentials;
  }

  export function fetchBaseQuery(args: FetchBaseQueryArgs): BaseQueryFn;

  export interface EndpointDefinitions {
    [endpointName: string]: EndpointDefinition<any, any, any, any>;
  }

  export interface EndpointDefinition<QueryArg, ResultType, TagTypes extends string, ReducerPath extends string> {
    query: (arg: QueryArg) => any;
    transformResponse?: (baseQueryReturnValue: any) => ResultType;
    providesTags?: Array<TagTypes> | ((result: ResultType, error: any, arg: QueryArg) => Array<TagTypes | { type: TagTypes; id?: string | number }>);
    invalidatesTags?: Array<TagTypes> | ((result: ResultType, error: any, arg: QueryArg) => Array<TagTypes | { type: TagTypes; id?: string | number }>);
  }

  export interface ApiEndpointQuery<
    QueryArg,
    ResultType,
    TagTypes extends string
  > {
    (arg: QueryArg): any;
    select: (state: any) => ResultType;
    type: string;
  }

  export interface ApiEndpointMutation<
    QueryArg,
    ResultType,
    TagTypes extends string
  > {
    (arg: QueryArg): any;
    select: (state: any) => ResultType;
    type: string;
  }

  export interface EndpointBuilder<BaseQuery, TagTypes extends string, ReducerPath extends string> {
    query<QueryArg, ResultType>(
      definition: {
        query: (arg: QueryArg) => any;
        transformResponse?: (baseQueryReturnValue: any) => ResultType;
        providesTags?: Array<TagTypes> | ((result: ResultType, error: any, arg: QueryArg) => Array<TagTypes | { type: TagTypes; id?: string | number }>);
      }
    ): any;
    
    mutation<QueryArg, ResultType>(
      definition: {
        query: (arg: QueryArg) => any;
        transformResponse?: (baseQueryReturnValue: any) => ResultType;
        invalidatesTags?: Array<TagTypes> | ((result: ResultType, error: any, arg: QueryArg) => Array<TagTypes | { type: TagTypes; id?: string | number }>);
      }
    ): any;
  }

  export interface CreateApiOptions<
    BaseQuery extends BaseQueryFn,
    TagTypes extends string = never,
    ReducerPath extends string = string
  > {
    reducerPath: ReducerPath;
    baseQuery: BaseQuery;
    tagTypes?: readonly TagTypes[];
    endpoints: (build: EndpointBuilder<BaseQuery, TagTypes, ReducerPath>) => any;
  }

  export function createApi<
    BaseQuery extends BaseQueryFn,
    TagTypes extends string = never,
    ReducerPath extends string = string
  >(
    options: CreateApiOptions<BaseQuery, TagTypes, ReducerPath>
  ): any;
}
