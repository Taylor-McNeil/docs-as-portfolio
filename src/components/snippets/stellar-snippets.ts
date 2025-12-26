// Schema examples for Stellar API case study
// Shows the modular OpenAPI architecture with $ref patterns

export const accountsEndpointSnippet = `paths:
  /accounts/{account_id}:
    get:
      tags:
        - Accounts
      summary: Retrieve an Account
      description: The single account endpoint provides information on a specific account.
      operationId: RetrieveAnAccount
      parameters:
        - $ref: '../parameters.yml#/components/parameters/AccountIDParam'
      responses:
        '200':
          description: Returns details about an account.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "../schemas/linksSchema.yml#/components/schemas/Links"
                  - $ref: "../schemas/accountSchema.yml#/components/schemas/Account"
              examples:
                RetrieveAnAccount:
                  $ref: "../examples/responses/Accounts/RetrieveAnAccount.yml"`;

export const accountsTransactionsSnippet = `  /accounts/{account_id}/transactions:
    get:
      tags:
        - Accounts
      summary: Retrieve an Account's Transactions
      operationId: GetTransactionsByAccountId
      parameters:
        - $ref: '../parameters.yml#/components/parameters/AccountIDParam'
        - $ref: '../parameters.yml#/components/parameters/CursorParam'
        - $ref: '../parameters.yml#/components/parameters/OrderParam'
        - $ref: '../parameters.yml#/components/parameters/LimitParam'
        - $ref: '../parameters.yml#/components/parameters/IncludeFailedParam'
      x-supports-streaming: true
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "../schemas/linksSchema.yml#/components/schemas/Links"
                  - $ref: "../schemas/transactionSchema.yml#/components/schemas/Transaction"`;

export const parametersSnippet = `components:
  parameters:
    AccountIDParam:
      name: account_id
      in: path
      required: true
      description: This account's public key encoded in a base32 string representation.
      schema:
        type: string
        example: GDMQQNJM4UL7QIA66P7R2PZHMQINWZBM77BEBMHLFXD5JEUAHGJ7R4JZ

    CursorParam:
      name: cursor
      in: query
      required: false
      description: A number that points to a specific location in a collection of responses.
      schema:
        type: integer
        example: 6606617478959105

    LimitParam:
      name: limit
      in: query
      required: false
      description: The maximum number of records returned. Defaults to 10, max 200.
      schema:
        type: integer
        example: 10

    OrderParam:
      name: order
      in: query
      required: false
      description: Sort order. Options include asc (ascending) or desc (descending).
      schema:
        type: string
        enum:
          - asc
          - desc`;

export const fileStructure = `openapi/
├── horizon/
│   ├── components/
│   │   ├── endpoints/
│   │   │   ├── accounts.yml
│   │   │   ├── transactions.yml
│   │   │   ├── operations.yml
│   │   │   └── ...
│   │   ├── parameters.yml
│   │   ├── schemas/
│   │   │   ├── accountSchema.yml
│   │   │   ├── transactionSchema.yml
│   │   │   └── ...
│   │   └── examples/
│   │       └── responses/
│   └── main.yml
└── anchor-platform/
    ├── schemas.yaml
    └── bundled-platform.yaml`;