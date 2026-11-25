# Why the homepage beat the cancellation guide

This comparison covers revisions `0db2745` and `e010ccc`. The scores below belong to those two builds.

For “My paper order was canceled. Did any shares fill?”, the previous guide at `0db2745` already had the right section. Page search put the guide second and selected the correct heading within it. The ranking error happened when Thally chose the page.

Thally Core 0.2.18 uses Orama 3.1.18 for full-text page search. The title has a weight of 3, headings 2, and keywords and description 1.5 each. Pages without authored keywords inherit words from the title and slug. That gave the homepage, “Did the order fill?”, two places to match “did”, “order” and “fill”. The cancellation guide inherited terms such as “check”, “much” and “checkanorder”.

On the baseline Next.js build, searching individual fields in the same index reproduced the live score to ten decimal places when summed. The homepage gained 7.620 points over the guide from titles and keywords. The guide recovered 6.794 through its headings, description and body. That left the homepage ahead by 0.825. Thally selected the heading within each page after ranking them.

## One metadata edit

The guide now supplies three terms in native MDX frontmatter:

```yaml
keywords: ["canceled paper order", "partial fill", "order lookup"]
```

These terms replace the guide’s generated keywords. In the rebuilt Next.js index, the guide’s keyword contribution rose from 1.052 to 3.198, while the homepage’s fell from 3.945 to 3.018. The other fields retained their contributions for this ticket. The guide now wins **14.851 to 12.604** and opens the original cancellation heading. Scores are specific to this local index. [Open the destination](http://localhost:3041/guides/check-an-order#read-the-filled-quantity-after-cancellation)

## What changed for seven questions

The two page-search interfaces, HTTP full-text search and MCP `search_docs`, returned the same ranked links and snippets in the Next.js replay. Native MCP `search_sections` builds passages from page titles and section content. Within each runtime, all 21 top-three section results kept their exact order, headings, citations, text and numeric scores. The local indexed Worker returned the same ordered destinations and text as Next.js. The runtimes have slightly different scoring values.

| Reader’s task | First page before → after | Relevant MCP passage rank before → after |
| --- | --- | --- |
| Check whether an accepted order executed | Quickstart → Quickstart | 1 → 1 |
| Account for three filled and seven canceled shares | Order guide → Order guide | 1 → 1 |
| Recover a lost order response | Order guide → Order guide | 1 → 1 |
| Run the lab without an account | Quickstart → Quickstart | 1 → 1 |
| Test a support passage after drafting it | Writing guide → Writing guide | 1 → 1 |
| Answer the short cancellation ticket | Homepage → Order guide | 1 → 1 |
| Check the excerpt an assistant gets (writer paraphrase) | Homepage → Homepage | 2 → 2 |

The original five retained all three page destinations in order. For the writer paraphrase the quickstart moved from third to second, the order guide dropped from second to third, and the writing guide stayed fourth. Two additional customer phrasings were recorded separately. Page search moved the order guide from second to first for “How do I tell whether anything executed?” in the context of a canceled paper trade. The version using the British spelling “cancelled” already found it first. Their relevant MCP passages stayed second.

The first page-search snippet for the short ticket now says that status alone leaves the quantity unknown. Its preview cuts off the field name. The standard search dialog displays the page description and links to the heading. A tab that had already run the query showed the previous order once after the server restarted. Repeating the identical search showed the guide first. Selecting it opened the original heading. An agent seeking the actual `filled_qty` explanation can read the section or follow its citation.

From the running local checkout, `node checks/verify-guide.mjs http://localhost:3041` verifies the reviewed links and passage text for all seven questions. Add `--capture` to inspect the returned passages. [Original five questions](retrieval-cases.json) · [Short ticket and writer paraphrase](retrieval-probes.json)

## After correcting the tutorial and stock-order lab

In a subsequent local review, the lab was scoped to quantity-based stock orders and the tutorial began asking writers to distinguish the customer’s order from the fixture. The resulting section temporarily slipped from second to third for the writer paraphrase. We changed “which passage they’ll get” to “which excerpt an assistant gets for that ticket” in the procedure and replayed the seven questions. The procedure then ranked first in section search and its page ranked second behind the homepage. At `e010ccc` those ranks were second and fourth. The short cancellation ticket still opened the practical guide first on both interfaces. The other five questions kept their first page and first section. These results are specific to the seven recorded questions.

## After adding task navigation and an agent reference

The expanded guide has five indexed pages. The verification appendix remains available by direct link. The seven original questions are unchanged. On this build, full-text page search and MCP section search both put the intended destination first for each question. The writer’s paraphrase improved from page rank two to one. Its first passage still tells the author to inspect the excerpt, edit one passage, rebuild and compare the same ticket.

Adding homepage links initially moved the offline lab from first to third in page search for the no-account question. The correct passage still ranked first in section search. Revising the quickstart description to identify the runnable lab, local data and account requirements restored its first-place page result.

We also asked three questions about using the documentation itself. On the earlier site, none had a complete answer in the first three MCP passages. With the agent reference in the index, each retrieved the passage that completes the task first.

| Agent task | Evidence in the first retrieved passage |
| --- | --- |
| Configure a client | The server URL, Streamable HTTP transport and anonymous access |
| Verify a citation | How to pass a result’s `page_id` to `read_page` and check the fragment against a heading |
| Navigate without HTML | How to request Markdown or JSON and follow `nav.next.href` |

Thally’s card links rendered in HTML and Markdown but were absent from the homepage’s JSON `content.links` in an earlier draft. Ordinary Markdown links carried all five task destinations across all three formats. The [local verifier](verify-guide.mjs) checks the link inventory and [three agent questions](agent-access-cases.json) alongside the original replay. These results describe ten fixed questions on this corpus.
