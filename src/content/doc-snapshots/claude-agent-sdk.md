> This page location: /docs.md > /docs/development.md > /docs/atlas/ai-integrations.md

> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Integrate MongoDB with the Claude Agent SDK

You can integrate MongoDB with the [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python) to persist and resume agent sessions across hosts. The Claude Agent SDK is a Python library from Anthropic that runs Claude Code as an agent inside your application.

## Overview

The `claude-agent-sdk-mongodb-session-store` package provides a MongoDB-backed session store adapter for Claude Agent SDK conversations in your application. A session is a record of the conversation and the actions an agent takes, stored as individual entries. By default, the Claude Agent SDK stores the transcript on the host that invokes the agent. The MongoDB adapter also saves those entries to MongoDB, so the transcript is kept both on the host and in MongoDB. You can then resume the session from another host.

You can use the adapter to perform the following tasks:

- Resume a session from a different process or host

- Keep session history in the same deployment as your application data

- Query and audit session history with MongoDB tools

## Installation and Setup

To use the adapter, you must have the following components available:

- Python 3.10 or later

- A MongoDB deployment that runs MongoDB 7.0 or later

- An Anthropic API key

To learn how to get and set your Anthropic API key, see the [Claude Agent SDK Quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart). The session store does not use or see this key.

In your terminal, run the following command to install the adapter and its dependencies:

```shell
uv add claude-agent-sdk-mongodb-session-store
```

This command installs the adapter and its `claude-agent-sdk` and `pymongo` dependencies.

Set your connection string in an environment variable, as shown in the following example. The adapter uses the client that you create, so your credentials stay in your client configuration:

```shell
export MONGODB_URI="<connection-string>"
```

## Persist a Session

By default, the Claude Agent SDK keeps each session transcript only on the host where the agent runs. The following example creates a MongoDB session store, initializes its indexes, and runs a query. The adapter persists the session transcript to MongoDB as the agent runs. The example prints the result and the session ID that the SDK assigns.

```python
import asyncio
import os

from pymongo import AsyncMongoClient
from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
from claude_agent_sdk_mongodb_session_store import MongoDBSessionStore


async def main() -> None:
    client = AsyncMongoClient(
        os.environ["MONGODB_URI"],
        readPreference="primary",
        w="majority",
        serverSelectionTimeoutMS=10_000,
        timeoutMS=20_000,
    )
    store = MongoDBSessionStore(client=client, db_name="claude")

    # Set up the database indexes that optimize the store's performance.
    # This operation is idempotent, so you can run it on every startup.
    await store.create_schema()

    async for message in query(
        prompt="Review this codebase and explain what it does.",
        options=ClaudeAgentOptions(session_store=store),
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)
            # The SDK assigns the session ID. Save it so that you can
            # resume the session later.
            print(f"Session ID: {message.session_id}")

    await client.close()


asyncio.run(main())

```

## Resume a Session

To resume a session, create a `ClaudeAgentOptions` object and pass the store object and session ID of the session that you want to resume. The SDK returns the session ID in the `session_id` field of the first run's result message.

You can use the following snippet inside an async function to resume a session. Replace `<session-id>` with your session ID:

```python
# Pass the same store and the session ID from the earlier run.
async for message in query(
    prompt="Suggest how to improve this codebase.",
    options=ClaudeAgentOptions(
        session_store=store,
        resume="<session-id>",
    ),
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(message.result)

```

## Retention and Operational Considerations

The adapter stores each transcript entry as a document and never deletes sessions on its own. To remove sessions that are no longer active, call `delete_inactive()` on a schedule, such as from a cron job or an Atlas scheduled trigger:

```python
from datetime import timedelta

# Delete every session with no new entries in the last 30 days.
deleted = await store.delete_inactive(timedelta(days=30))
print(f"Deleted {deleted} inactive sessions.")

```

Do not delete individual entries with a time-to-live index or a `delete_many()` filter on the entry time. Removing the oldest entries of a session that is still in use leaves a transcript that your application cannot resume.

### Client Configuration

The session store uses the configuration of your `AsyncMongoClient` and sets no options of its own. Use the following production settings:

- `readPreference="primary"`: Reads the latest entries when a session resumes

- `w="majority"`: Acknowledges an append only after a majority of replica set members confirm it

- `serverSelectionTimeoutMS=10_000`: Stops the client from waiting indefinitely for an available server

- `timeoutMS=20_000`: Stops an operation from exceeding the 60-second limit that the Claude Agent SDK allows

To learn more about read preferences and write concerns, see the [read preference](https://www.mongodb.com/docs/manual/core/read-preference/) and [write concern](https://www.mongodb.com/docs/manual/reference/write-concern/) documentation.

### Concurrency

The store is designed for one writer per session. Avoid running multiple processes writing to the same session concurrently, as additional writers can cause append operations to fail. Grant your application user the `readWrite` role on the database only. To learn more about database roles, see the [built-in roles documentation.](https://www.mongodb.com/docs/manual/reference/built-in-roles/)

### Data Security and Privacy

Your transcript store can contain sensitive information. Each entry stores user prompts, assistant replies, tool inputs, and results. These can include file contents, command output, credentials, and personal data. Use the following steps to protect your transcript data:

- Connect over TLS to protect data in transit.

- Authenticate with a dedicated database user.

- Grant the dedicated user the `readWrite` role on the database only.

- Enable encryption at rest.

To learn more about securing data with encryption and authentication, see the [Encryption documentation.](https://www.mongodb.com/docs/manual/core/security-data-encryption/)

## Additional Resources

To learn more about the MongoDB session store adapter and the Claude Agent SDK, see the following resources:

- [Claude Agent SDK session storage documentation](https://code.claude.com/docs/en/agent-sdk/session-storage)

- [MongoDB session store adapter repository](https://github.com//mongodb-developer/claude-agent-sdk-mongodb-session-store)

Visit the repository to stay updated on the adapter and consider starring the repository.
