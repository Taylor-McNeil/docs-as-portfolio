## DeepAgents Virtual File System

[LangChain DeepAgents](https://github.com/langchain-ai/deepagents) is an agent harness designed for long-running, multi-step tasks. It handles planning, context management, and delegating work to sub-agents. The harness supports a swappable backend protocol that lets you change where an agent's files actually live. The `langchain-mongodb-deepagents-vfs` package is an implementation of that protocol: Amazon S3 holds the files, an embedding provider (AWS Bedrock or OpenAI) computes embeddings, MongoDB Atlas holds the chunks and embeddings, and the `MongoFilesystemBackend` class routes each file operation to the correct handler.

Use this package when your agent needs to search a large set of existing files in S3. `grep` runs as a single MongoDB aggregation that combines full-text and vector search results using the Reciprocal Rank Fusion (RRF) algorithm, so it scales without loading every file into your agent to filter them one by one. `glob` and `ls` handle filename and directory lookups directly. When an agent calls `read`, `write`, `edit`, `upload_files`, or `download_files`, those calls go directly to S3, where your files live. Files added by other tools are automatically picked up and indexed by the backend's watcher.

Before you install the package, make sure you have:

- A MongoDB Atlas connection string

- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`), with an IAM policy granting:

  - `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`, and `s3:DeleteObject` on your S3 bucket

  - `bedrock:InvokeModel` on `amazon.titan-embed-text-v2:0`, in the same region as `AWS_DEFAULT_REGION`, needed if you use the default Bedrock provider

- Your choice of embedding provider: Bedrock (the default, uses the AWS credentials above) or OpenAI (set `EMBEDDING_PROVIDER=openai` and provide an `OPENAI_API_KEY`)

To install the package, determine whether you want MongoDB to generate search embeddings by using AWS Bedrock or OpenAI, and run the matching command:

```python
pip install "langchain-mongodb-deepagents-vfs[bedrock]"
```

```python
pip install "langchain-mongodb-deepagents-vfs[openai]"
```

### Usage

Instantiate `MongoFilesystemBackend` with your S3 bucket name and Atlas connection string. The following example writes two files to S3, then demonstrates each search method:

- `grep` searches the file's content

- `glob` matches file paths by pattern

- `ls` lists a directory's contents

```python
from langchain_mongodb_deepagents_vfs import MongoFilesystemBackend

# Instantiate the backend
backend = MongoFilesystemBackend(
    s3_bucket_name="<bucket-name>",                   # S3 bucket that stores your files
    mongodb_connection_string="<connection-string>",  # MongoDB Atlas connection string
)

# Write two files to S3: one .txt, one .md, so glob can demonstrate
# filtering by extension
backend.write("mongodb_vfs/docs/notes.txt", "Our authentication flow uses OAuth 2.0.")
backend.write("mongodb_vfs/docs/overview.md", "This directory contains onboarding docs.")

# Search for files that mention "authentication flow"
# Newly written files can take a few seconds to become searchable
result = backend.grep("authentication flow", path="mongodb_vfs/docs/")
print("grep matches:")
for match in result.matches or []:
   print(match["path"], match["line"], match["text"])

# Find files that match a glob pattern
result = backend.glob("*.txt", path="mongodb_vfs/docs/")
print("glob matches:", result.matches)

# List the contents of a directory
result = backend.ls("mongodb_vfs/docs/")
print("ls entries:", result.entries)

print("init_errors:", backend.init_errors)
```

By default, the backend restricts every operation to the `mongodb_vfs/` prefix in your bucket. Pass a different `s3_prefix` value to `MongoFilesystemBackend` to change this, or `s3_prefix=""` for whole-bucket access.

**Note:**

To learn how to connect this backend to a DeepAgents agent, see the [DeepAgents Quickstart.](https://docs.langchain.com/oss/deepagents/code/quickstart)

