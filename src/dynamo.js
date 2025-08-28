// src/dynamo.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

export const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({}),
  { marshallOptions: { removeUndefinedValues: true } }
);

export const listAllItems = async (tableName) => {
  try {
    const res = await docClient.send(new ScanCommand({ TableName: tableName }));
    // return Items or empty array
    return res?.Items ?? [];
  } catch (err) {
    // on error return empty array per spec
    return [];
  }
};

export const createItem = async (tableName, item) => {
  await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
  // return same item you passed in
  return item;
};

export const getItem = async (tableName, key) => {
  const res = await docClient.send(new GetCommand({ TableName: tableName, Key: key }));
  return res?.Item ?? null;
};

export const updateItem = async (tableName, key, changes) => {
  const names = {};
  const values = {};
  const sets = [];
  let i = 0;
  for (const [k, v] of Object.entries(changes)) {
    const n = `#n${i}`;
    const val = `:v${i}`;
    names[n] = k;
    values[val] = v;
    sets.push(`${n} = ${val}`);
    i++;
  }

  const res = await docClient.send(new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${sets.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: "ALL_NEW",
  }));

  return res?.Attributes ?? null;
};

export const deleteItem = async (tableName, key) => {
  const res = await docClient.send(new DeleteCommand({
    TableName: tableName,
    Key: key,
    ReturnValues: "ALL_OLD",
  }));
  return res?.Attributes ?? null;
};
