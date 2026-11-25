# When page search finds the instructions and section search misses them

These results describe the reference site at `7f30f0a`. A later study revisited the [short customer ticket](short-ticket-study.md) and extended the replay to seven questions.

A writer wants to know what an assistant will retrieve from a draft support page. In the original guide, page search linked directly to **Test your answer with Thally section search**. The three passages returned by MCP told the writer about the tutorial, how to start the site and how to draft a paragraph. None gave the writer the procedure to try.

## How the same words led to different results

Thally’s full-text page search ranked each page, then selected a heading within the winning page. The procedure won that second step. Native MCP `search_sections` ranked passages from all four indexed pages using a BM25-style lexical score. For the same question, the original procedure scored 0.0558. The introduction (0.0881), setup (0.0684) and writing exercise (0.0601) all belonged to the same article. Thally 0.2.18 returns at most three passages per page. Even a request for 20 results omitted the procedure.

We edited the body of one indexed section. Its heading, URL and shell command stayed in place. The paragraph now names the writer’s task, explains what the command returns, and gives the writer two decisions. If the answer gets the quantities wrong, fix the paragraph against the fixture. If the right paragraph is present but ranks second, third or is missing, confirm it on the preview, change its heading and repeat the same ticket after rebuilding. If the first excerpt can close the ticket with the right evidence, the writer can stop. The final procedure scored 0.2473 and ranked first.

## First passage that answered the entire question

The same five questions went to both endpoints before and after the edit. One agent graded the deduplicated passage texts against the original criteria, with ranks and revisions hidden. The table gives the first complete MCP answer within three results. All five page searches kept the same three destinations in the same order. [Exact questions and grading criteria](retrieval-cases.json)

| Reader’s task | Before | After | First complete passage after the edit |
| --- | --- | --- | --- |
| Decide whether an accepted order counts as ten shares bought | 1 | 1 | Inspect a paper order snapshot |
| Account for the three filled shares and seven canceled shares | 1 | 1 | Read the filled quantity after cancellation |
| Recover a lost response using the app’s client order ID | 1 | 1 | Recover the order after a lost response |
| Run the lab without an Alpaca account | 1 | 1 | Inspect a paper order snapshot |
| Test which passage a teammate’s question retrieves and decide what to revise | None in three | 1 | Test your answer with Thally section search |

The four support questions kept their first answers word for word. The cancellation question lost a second complete answer among its runners-up. A second reviewer tried two questions written before seeing the edit. The question about double-counting fills kept its first-place answer. For “Our help article reads well in the browser. How can I check which excerpt an assistant will get for a ticket and tell if changing the wording helped?”, the procedure went from missing to second. Page search still favored the order-cancellation guide for this phrasing.

## Where the reader got stuck

On a fresh three-page starter, a learner wrote an accurate passage headed “How many shares filled before cancellation?” The homepage ranked first and told the customer to read another page. The learner’s answer ranked third. The first draft of the procedure gave advice for an absent passage and left this reader to infer what to do with a correct answer at rank three.

The final instructions cover that case. The learner confirmed the paragraph on their own preview, changed only its heading to “My paper order was canceled. Did any shares fill?”, rebuilt and asked the identical question. Their passage moved from third to first and still gave the same three facts. On the four-page reference site at `7f30f0a`, the fixture explanation for the same short ticket ranked third. The later [short-ticket study](short-ticket-study.md) tested the missing lookup for the customer’s own order. The longer cancellation question in the table supplies the quantities and retrieves the cancellation guide first.

## Reproduce locally

Start the preview per the README. The check replays all five questions, verifies every returned anchor, and compares the ordered page links and the exact text of each MCP excerpt with the reviewed results.

```sh
node checks/verify-guide.mjs http://localhost:3041
node checks/verify-guide.mjs http://localhost:3041 --capture
```

The local Next.js preview and indexed Cloudflare Worker returned the same 15 passage texts and ranked links for the five questions. The command in the winning excerpt also ran on a learner’s own preview and returned its original passage about three filled and seven canceled. For an interactive check, paste the writer’s question below into the [local comparison](http://localhost:3041/guides/check-your-build#try-the-search-on-this-example-site) and select **Run search**.

> I’m writing a support page in Thally. After I draft my answer, how can I see which part a teammate’s question retrieves, and decide whether I need to revise it?
