# Did any shares fill before cancellation?

This study describes section search at `0db2745`. The [page-search follow-up](page-search-study.md) tests how the same ticket lands on the guide in the standard docs search.

“My paper order was canceled. Did any shares fill?” gives a support agent a status and no executed quantity. A useful answer explains where to find that quantity and how to interpret it. The local guide’s ten-share order is a worked example. Its three filled shares belong to that fixture.

## Why the worked answer ranked third

On the previous site at `7f30f0a`, Thally’s native `search_sections` ranked the homepage first (0.7375), the tutorial introduction second (0.6074) and the cancellation walkthrough third (0.5916). The homepage uses “did” and “fill” in its title. The short tutorial introduction quotes the whole ticket. In the pinned lexical ranker, “filled” and “fill” are distinct, as are “cancellation” and “canceled”. The six normalized query terms matched none of the walkthrough’s heading words. The walkthrough earned most of its score from the body. All three results fit the passage limits.

An initial draft split off a short customer answer under a new heading. It won the short ticket, but displaced the accepted-order answer and the writer’s procedure on other queries. The final edit revised the heading and opening of the existing section in place. The site kept eleven passages and the existing citation ID. The customer answer scored 0.7493, just ahead of the homepage at 0.7412. Page search still put the homepage first and the cancellation guide second.

## What each reader received

The table tracks each task’s target passage within the first three native section results. On the short ticket, the old passage at rank three explained the fixture but omitted the read-only lookup for the customer’s own order. An independent reviewer graded the returned passages with version and ranking hidden.

| Task | Original | Separate answer section | Edit in place |
| --- | ---: | ---: | ---: |
| Short cancellation ticket | 3 (fixture only) | 1 | 1 |
| Distinguish acceptance from execution | 1 | 2 | 1 |
| Account for three filled and seven canceled shares | 1 | 1 | 1 |
| Recover a lost response with a client order ID | 1 | 1 | 1 |
| Run the lab without an account | 1 | 1 | 1 |
| Test and revise a support passage | 1 | 1 | 1 |
| Writer paraphrase about the excerpt an assistant gets | 2 | 3 | 2 |

For the five original questions, all first page destinations and first section URLs were preserved in the final version. The writer paraphrase’s first page moved from the cancellation guide to the homepage. Its complete MCP procedure remained second. The account-free quickstart kept its original text and rank throughout. It gives the command and names the local fixtures. The blind reviewer found it did not explicitly say the command makes no brokerage request, a stricter reading than the previous study. [Original questions](retrieval-cases.json) · [Supplemental questions and criteria](retrieval-probes.json)

## What an agent can establish

The documentation MCP advertises eight read-only tools. To verify the answer, discover the endpoint, call `search_sections`, then pass the winning result’s `page_id` to `read_page`. Its `headings` list contains the same ID as the fragment in `section_url`. The rendered site also retains that ID. This lets a reader follow the citation after the heading changes. [Open the cited section locally](http://localhost:3041/guides/check-an-order#read-the-filled-quantity-after-cancellation)

For a customer who supplies only a canceled status, the number is unknown. A zero `filled_qty` means zero shares filled. A positive value reports the executed quantity, including a fractional fill. The next step is to read that field from the existing order in the same paper account. In this test, the downloaded inspector printed 3 of 10 for the distributed fixture, 0 of 8 for a synthetic zero-fill record and 2.5 of 8 for a separate synthetic partial fill. Neither the documentation search nor those offline examples accessed a customer's order. [Alpaca single-order lookup](https://docs.alpaca.markets/us/reference/getorderbyorderid-1)

To reproduce the seven queries, start the local preview from the README and run:

```sh
node checks/verify-guide.mjs http://localhost:3041
node checks/verify-guide.mjs http://localhost:3041 --capture
```

The replay checks native discovery, source projections, heading citations, downloads, and the ordered page and passage results. Next.js and a separately indexed local Worker returned the same ordered destinations and excerpt text for all seven questions. [Try the short ticket in the local comparison](http://localhost:3041/guides/check-your-build#try-the-search-on-this-example-site)
