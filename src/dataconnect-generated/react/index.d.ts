import { CreateDemoUserData, GetMyTransactionsData, CreateTransactionData, CreateTransactionVariables, DeleteTransactionData, DeleteTransactionVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateDemoUser(options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;
export function useCreateDemoUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;

export function useGetMyTransactions(options?: useDataConnectQueryOptions<GetMyTransactionsData>): UseDataConnectQueryResult<GetMyTransactionsData, undefined>;
export function useGetMyTransactions(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyTransactionsData>): UseDataConnectQueryResult<GetMyTransactionsData, undefined>;

export function useCreateTransaction(options?: useDataConnectMutationOptions<CreateTransactionData, FirebaseError, CreateTransactionVariables>): UseDataConnectMutationResult<CreateTransactionData, CreateTransactionVariables>;
export function useCreateTransaction(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTransactionData, FirebaseError, CreateTransactionVariables>): UseDataConnectMutationResult<CreateTransactionData, CreateTransactionVariables>;

export function useDeleteTransaction(options?: useDataConnectMutationOptions<DeleteTransactionData, FirebaseError, DeleteTransactionVariables>): UseDataConnectMutationResult<DeleteTransactionData, DeleteTransactionVariables>;
export function useDeleteTransaction(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTransactionData, FirebaseError, DeleteTransactionVariables>): UseDataConnectMutationResult<DeleteTransactionData, DeleteTransactionVariables>;
