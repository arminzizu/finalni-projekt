import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Budget_Key {
  id: UUIDString;
  __typename?: 'Budget_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateDemoUserData {
  user_insertMany: User_Key[];
  category_insertMany: Category_Key[];
  transaction_insertMany: Transaction_Key[];
  budget_insertMany: Budget_Key[];
}

export interface CreateTransactionData {
  transaction_insert: Transaction_Key;
}

export interface CreateTransactionVariables {
  categoryId: UUIDString;
  amount: number;
  date: DateString;
  description?: string | null;
  type: string;
}

export interface DeleteTransactionData {
  transaction_delete?: Transaction_Key | null;
}

export interface DeleteTransactionVariables {
  id: UUIDString;
}

export interface GetMyTransactionsData {
  transactions: ({
    id: UUIDString;
    amount: number;
    date: DateString;
    description?: string | null;
    category: {
      id: UUIDString;
      name: string;
    } & Category_Key;
  } & Transaction_Key)[];
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateDemoUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
  operationName: string;
}
export const createDemoUserRef: CreateDemoUserRef;

export function createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;
export function createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface GetMyTransactionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTransactionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyTransactionsData, undefined>;
  operationName: string;
}
export const getMyTransactionsRef: GetMyTransactionsRef;

export function getMyTransactions(): QueryPromise<GetMyTransactionsData, undefined>;
export function getMyTransactions(dc: DataConnect): QueryPromise<GetMyTransactionsData, undefined>;

interface CreateTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
  operationName: string;
}
export const createTransactionRef: CreateTransactionRef;

export function createTransaction(vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;
export function createTransaction(dc: DataConnect, vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;

interface DeleteTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTransactionVariables): MutationRef<DeleteTransactionData, DeleteTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTransactionVariables): MutationRef<DeleteTransactionData, DeleteTransactionVariables>;
  operationName: string;
}
export const deleteTransactionRef: DeleteTransactionRef;

export function deleteTransaction(vars: DeleteTransactionVariables): MutationPromise<DeleteTransactionData, DeleteTransactionVariables>;
export function deleteTransaction(dc: DataConnect, vars: DeleteTransactionVariables): MutationPromise<DeleteTransactionData, DeleteTransactionVariables>;

