# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMyTransactions*](#getmytransactions)
- [**Mutations**](#mutations)
  - [*CreateDemoUser*](#createdemouser)
  - [*CreateTransaction*](#createtransaction)
  - [*DeleteTransaction*](#deletetransaction)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMyTransactions
You can execute the `GetMyTransactions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyTransactions(): QueryPromise<GetMyTransactionsData, undefined>;

interface GetMyTransactionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTransactionsData, undefined>;
}
export const getMyTransactionsRef: GetMyTransactionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyTransactions(dc: DataConnect): QueryPromise<GetMyTransactionsData, undefined>;

interface GetMyTransactionsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyTransactionsData, undefined>;
}
export const getMyTransactionsRef: GetMyTransactionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyTransactionsRef:
```typescript
const name = getMyTransactionsRef.operationName;
console.log(name);
```

### Variables
The `GetMyTransactions` query has no variables.
### Return Type
Recall that executing the `GetMyTransactions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyTransactionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyTransactions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyTransactions } from '@dataconnect/generated';


// Call the `getMyTransactions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyTransactions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyTransactions(dataConnect);

console.log(data.transactions);

// Or, you can use the `Promise` API.
getMyTransactions().then((response) => {
  const data = response.data;
  console.log(data.transactions);
});
```

### Using `GetMyTransactions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyTransactionsRef } from '@dataconnect/generated';


// Call the `getMyTransactionsRef()` function to get a reference to the query.
const ref = getMyTransactionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyTransactionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.transactions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.transactions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateDemoUser
You can execute the `CreateDemoUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDemoUserRef:
```typescript
const name = createDemoUserRef.operationName;
console.log(name);
```

### Variables
The `CreateDemoUser` mutation has no variables.
### Return Type
Recall that executing the `CreateDemoUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDemoUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDemoUserData {
  user_insertMany: User_Key[];
  category_insertMany: Category_Key[];
  transaction_insertMany: Transaction_Key[];
  budget_insertMany: Budget_Key[];
}
```
### Using `CreateDemoUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDemoUser } from '@dataconnect/generated';


// Call the `createDemoUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDemoUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDemoUser(dataConnect);

console.log(data.user_insertMany);
console.log(data.category_insertMany);
console.log(data.transaction_insertMany);
console.log(data.budget_insertMany);

// Or, you can use the `Promise` API.
createDemoUser().then((response) => {
  const data = response.data;
  console.log(data.user_insertMany);
  console.log(data.category_insertMany);
  console.log(data.transaction_insertMany);
  console.log(data.budget_insertMany);
});
```

### Using `CreateDemoUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDemoUserRef } from '@dataconnect/generated';


// Call the `createDemoUserRef()` function to get a reference to the mutation.
const ref = createDemoUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDemoUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insertMany);
console.log(data.category_insertMany);
console.log(data.transaction_insertMany);
console.log(data.budget_insertMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insertMany);
  console.log(data.category_insertMany);
  console.log(data.transaction_insertMany);
  console.log(data.budget_insertMany);
});
```

## CreateTransaction
You can execute the `CreateTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTransaction(vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;

interface CreateTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
}
export const createTransactionRef: CreateTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTransaction(dc: DataConnect, vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;

interface CreateTransactionRef {
  ...
  (dc: DataConnect, vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
}
export const createTransactionRef: CreateTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTransactionRef:
```typescript
const name = createTransactionRef.operationName;
console.log(name);
```

### Variables
The `CreateTransaction` mutation requires an argument of type `CreateTransactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTransactionVariables {
  categoryId: UUIDString;
  amount: number;
  date: DateString;
  description?: string | null;
  type: string;
}
```
### Return Type
Recall that executing the `CreateTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTransactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTransactionData {
  transaction_insert: Transaction_Key;
}
```
### Using `CreateTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTransaction, CreateTransactionVariables } from '@dataconnect/generated';

// The `CreateTransaction` mutation requires an argument of type `CreateTransactionVariables`:
const createTransactionVars: CreateTransactionVariables = {
  categoryId: ..., 
  amount: ..., 
  date: ..., 
  description: ..., // optional
  type: ..., 
};

// Call the `createTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTransaction(createTransactionVars);
// Variables can be defined inline as well.
const { data } = await createTransaction({ categoryId: ..., amount: ..., date: ..., description: ..., type: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTransaction(dataConnect, createTransactionVars);

console.log(data.transaction_insert);

// Or, you can use the `Promise` API.
createTransaction(createTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.transaction_insert);
});
```

### Using `CreateTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTransactionRef, CreateTransactionVariables } from '@dataconnect/generated';

// The `CreateTransaction` mutation requires an argument of type `CreateTransactionVariables`:
const createTransactionVars: CreateTransactionVariables = {
  categoryId: ..., 
  amount: ..., 
  date: ..., 
  description: ..., // optional
  type: ..., 
};

// Call the `createTransactionRef()` function to get a reference to the mutation.
const ref = createTransactionRef(createTransactionVars);
// Variables can be defined inline as well.
const ref = createTransactionRef({ categoryId: ..., amount: ..., date: ..., description: ..., type: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTransactionRef(dataConnect, createTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.transaction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.transaction_insert);
});
```

## DeleteTransaction
You can execute the `DeleteTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTransaction(vars: DeleteTransactionVariables): MutationPromise<DeleteTransactionData, DeleteTransactionVariables>;

interface DeleteTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTransactionVariables): MutationRef<DeleteTransactionData, DeleteTransactionVariables>;
}
export const deleteTransactionRef: DeleteTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTransaction(dc: DataConnect, vars: DeleteTransactionVariables): MutationPromise<DeleteTransactionData, DeleteTransactionVariables>;

interface DeleteTransactionRef {
  ...
  (dc: DataConnect, vars: DeleteTransactionVariables): MutationRef<DeleteTransactionData, DeleteTransactionVariables>;
}
export const deleteTransactionRef: DeleteTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTransactionRef:
```typescript
const name = deleteTransactionRef.operationName;
console.log(name);
```

### Variables
The `DeleteTransaction` mutation requires an argument of type `DeleteTransactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTransactionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTransactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTransactionData {
  transaction_delete?: Transaction_Key | null;
}
```
### Using `DeleteTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTransaction, DeleteTransactionVariables } from '@dataconnect/generated';

// The `DeleteTransaction` mutation requires an argument of type `DeleteTransactionVariables`:
const deleteTransactionVars: DeleteTransactionVariables = {
  id: ..., 
};

// Call the `deleteTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTransaction(deleteTransactionVars);
// Variables can be defined inline as well.
const { data } = await deleteTransaction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTransaction(dataConnect, deleteTransactionVars);

console.log(data.transaction_delete);

// Or, you can use the `Promise` API.
deleteTransaction(deleteTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.transaction_delete);
});
```

### Using `DeleteTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTransactionRef, DeleteTransactionVariables } from '@dataconnect/generated';

// The `DeleteTransaction` mutation requires an argument of type `DeleteTransactionVariables`:
const deleteTransactionVars: DeleteTransactionVariables = {
  id: ..., 
};

// Call the `deleteTransactionRef()` function to get a reference to the mutation.
const ref = deleteTransactionRef(deleteTransactionVars);
// Variables can be defined inline as well.
const ref = deleteTransactionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTransactionRef(dataConnect, deleteTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.transaction_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.transaction_delete);
});
```

