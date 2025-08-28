// src/dynamo.vitest.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { createItem, listAllItems, getItem, updateItem } from "./dynamo.js";

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe("CRUD (unit, mocked) with Vitest", () => {
  it("createItem returns the same item", async () => {
    ddbMock.on(PutCommand).resolves({});
    const item = { id: "1", text: "hi" };

    const out = await createItem("Testing", item);

    expect(out).toEqual(item);

    // optional: assert PutCommand was called with the expected input
    const putCalls = ddbMock.commandCalls(PutCommand, { TableName: "Testing", Item: item });
    expect(putCalls.length).toBe(1);
  });

  it("listAllItems returns items when present", async () => {
    ddbMock.on(ScanCommand).resolves({ Items: [{ id: "1", text: "hello" }] });

    const out = await listAllItems("Testing");

    expect(out).toEqual([{ id: "1", text: "hello" }]);
  });

  it("listAllItems returns [] when Items is missing or on error", async () => {
    // Items missing
    ddbMock.on(ScanCommand).resolves({});
    const out1 = await listAllItems("Testing");
    expect(Array.isArray(out1)).toBe(true);
    expect(out1).toEqual([]);

    // On error
    ddbMock.reset();
    ddbMock.on(ScanCommand).rejects(new Error("boom"));
    const out2 = await listAllItems("Testing");
    expect(out2).toEqual([]);
  });

  it("getItem returns the item when found and null when not", async () => {
    ddbMock.on(GetCommand).resolves({ Item: { id: "1", text: "hello" } });
    const found = await getItem("Testing", { id: "1" });
    expect(found).toEqual({ id: "1", text: "hello" });

    ddbMock.reset();
    ddbMock.on(GetCommand).resolves({});
    const notFound = await getItem("Testing", { id: "2" });
    expect(notFound).toBeNull();
  });

  it("updateItem returns updated attributes", async () => {
    ddbMock.on(UpdateCommand).resolves({ Attributes: { id: "1", text: "updated", count: 2 } });

    const res = await updateItem("Testing", { id: "1" }, { text: "updated", count: 2 });

    expect(res).toEqual({ id: "1", text: "updated", count: 2 });

    const updateCalls = ddbMock.commandCalls(UpdateCommand);
    expect(updateCalls.length).toBe(1);
  });
});
