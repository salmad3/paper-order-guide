# Paper Order Guide

A local Thally documentation sample for developers who need to interpret the fill quantity on an Alpaca Trading API paper order. The three JSON files are small synthetic projections of an order object. They contain no account data. The included Node script reads files offline. The practical guide also documents how a developer can read an existing order in their own paper account.

## Open the reviewer preview

Use Node.js 22.23.4 and npm. From the project root:

```sh
npm ci
export THALLY_SITE_URL=http://localhost:3041
npm run build && npm run typecheck
npm start -- --hostname 127.0.0.1 --port 3041
```

- Start with [Did the order fill?](http://localhost:3041/) and [the quickstart](http://localhost:3041/quickstart).
- [Check how much of an order filled](http://localhost:3041/guides/check-an-order) follows three cumulative snapshots and shows two read-only lookup routes.
- [Build a support guide with Thally](http://localhost:3041/guides/publish-with-thally) is the teaching article. It gives the reader an unfinished troubleshooting page to write and test in their own project.
- [Check the site you built](http://localhost:3041/guides/check-your-build) contains the browser comparison, source verification, raw MCP request and download check.

## Reproduce the checks

```sh
node --test checks/inspect-order.test.mjs
python3 checks/package-examples.py --check
node lab/inspect.mjs lab/fixtures/canceled.json
node public/search-passages.mjs http://localhost:3041 "My paper order was canceled. Did any shares fill?"
node checks/verify-guide.mjs http://localhost:3041
```

To rebuild the two distributed archives after editing their sources, run `python3 checks/package-examples.py`.

Thally supplies the MDX renderer, full-text page search, MCP section search, agent projections and component registry. The browser comparison and CLI helper send requests to those native endpoints. Alpaca's [order lookup](https://docs.alpaca.markets/us/reference/getorderbyorderid-1), [order lifecycle](https://docs.alpaca.markets/us/docs/orders-at-alpaca) and [paper trading guide](https://docs.alpaca.markets/us/docs/paper-trading) establish the product contract. The work is an independent documentation sample.

[Read the clean-starter trials](checks/reader-study.md) for the original and revised ranks on a learner’s own site.

[Read the five-question search study](checks/writing-search-study.md) to see why page search could find the writing procedure while MCP omitted it, and what changed when the procedure was rewritten.

[Review the short cancellation ticket](checks/short-ticket-study.md) for the two tested versions of the same passage, the seven-query replay, and what a documentation agent can establish from a status alone.

[See why the homepage won page search](checks/page-search-study.md) and how three native page keywords changed the result across the same seven questions.
