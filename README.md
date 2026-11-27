# Paper Order Guide

This is the source for the [Paper Order Guide](https://paper-orders.salmaddocs.com/), a self-hosted Thally site for developers who need to interpret fills on an Alpaca Trading API paper order.

- [Run the quickstart](https://paper-orders.salmaddocs.com/quickstart) to inspect the same synthetic order at acceptance, after a partial fill, and after cancellation. The downloaded Node script runs offline.
- [Check a canceled order](https://paper-orders.salmaddocs.com/guides/check-an-order#read-the-filled-quantity-after-cancellation) or [recover a lost response](https://paper-orders.salmaddocs.com/guides/check-an-order#recover-the-order-after-a-lost-response) to find the read-only lookup for an existing paper order.
- [Build a support guide with Thally](https://paper-orders.salmaddocs.com/guides/publish-with-thally) to write a troubleshooting passage and test what your own site returns.
- [Connect an agent](https://paper-orders.salmaddocs.com/guides/agent-access) to read and cite documentation. The [page index](https://paper-orders.salmaddocs.com/llms.txt) and [MCP manifest](https://paper-orders.salmaddocs.com/.well-known/mcp.json) are public.

## Run the site locally

Use Node.js 22.23.4 and npm. From the project root:

```sh
npm ci
export THALLY_SITE_URL=http://localhost:3041
npm run build && npm run typecheck
npm start -- --hostname 127.0.0.1 --port 3041
```

Open the [local preview](http://localhost:3041/). The [local search comparison](http://localhost:3041/guides/check-your-build#try-the-search-on-this-example-site) runs both full-text page search and MCP section search against that build.

## Self-host on Vercel

Import the Git repository into Vercel or upload its clean source directory with Vercel Drop. Include the project files, lockfile, MDX and `public/` assets. Use the repository root and the Next.js framework preset. The Node.js range in `package.json` selects the tested 22.x major. Vercel runs the production build and serves Thally’s page and section searches from the same domain as the documentation.

This read-only guide uses `THALLY_STORAGE=memory` in `vercel.json`. Runtime counters live for the lifetime of each server instance. The documentation and search inputs come from the deployed source.

On Vercel, `vercel.json` sets `THALLY_SITE_URL` to `https://paper-orders.salmaddocs.com` for both the build and the deployed functions. The MCP manifest advertises the endpoint on the hostname that served the request. For your own deployment, replace that origin in both Vercel settings, the published links in this README, and the examples in `src/content/guides/agent-access.mdx`. Add your domain to the Vercel project, follow its DNS instructions, then redeploy. Local npm builds can use `THALLY_SITE_URL=http://localhost:3041`.

Open the production quickstart signed out. Fetch `/.well-known/mcp.json` and confirm that its `endpoint` uses your production hostname. Run `node public/search-passages.mjs YOUR_ORIGIN "My paper order was canceled. Did any shares fill?"`. The first citation should open the troubleshooting guide at “Did any shares fill before cancellation?” [Thally’s Vercel deployment guide](https://docs.thally.io/guides/deploy-vercel)

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

[See why the homepage won page search](checks/page-search-study.md) and how the revised navigation performed on seven support and writing questions and three agent tasks.
