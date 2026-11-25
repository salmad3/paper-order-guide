# Can a developer write and retrieve their own answer?

In the original teaching trials, two fresh coding agents began from empty directories. Each received the teaching article, its linked materials and the generated Thally starter. Each wrote an original troubleshooting passage, served it on a separate local port and downloaded the example from its own quickstart. Both used the same ticket: “My paper order was canceled. Did any shares fill?” These were agent usability trials on one host.

The first reader's paragraph ranked first immediately. To identify the API field behind the script’s human-readable label, the reader had to inspect the raw JSON. The article now gives that command. Both fixture summaries showed the same order ID and three of ten shares filled.

The second reader reported the following results for the same question before and after rebuilding. Only the reader’s heading changed.

| Rank | First build | After the heading edit |
| --- | --- | --- |
| 1 | Did the order fill? | Did any shares fill before my paper order was canceled? |
| 2 | Check how much of an order filled (page introduction) | Did the order fill? |
| 3 | Inspect a paper order snapshot | Check how much of an order filled (page introduction) |

The original heading was “What happened to my ten shares?” Its passage was present in the HTML and matched the MDX source on disk, yet was missing from the three returned excerpts. After the edit, the reader opened the top result’s heading in Chrome. The paragraph beneath it reported the lab result, three shares filled and seven canceled. The trial checked the fixture. The ticket on its own supplies no fill quantity. Earlier and later snapshots had the same order ID. This change is evidence for that one question and that three-page site.

Fable 5.2 and Opus 5.5 separately reviewed the drafts at high effort in Claude Code. The reviews led to a single saved preview origin across terminals, a raw fixture read before drafting, and a truth check against the fixture after the search. Both reviewed the article at revision `90b4be5`, with SHA-256 `1b8954d100d4268f1f5a41f4c0e7e2ade52d5e03804fdc279e8d13ab706144dc`. The model sessions were text reviews. The fresh learners executed the instructions. All orders used in these tests were synthetic local records.

On the four-page reference site at `90b4be5`, four of five tasks received a complete first passage. For the writer's question, page search found the procedural heading and the top three MCP passages omitted the full steps. A subsequent edit to that section raised the writer's first complete answer to rank one. [Read the five-question comparison and its limits](writing-search-study.md).

## Can a reader answer the customer with only a status?

The revised exercise gives the learner two different pieces of evidence. The ticket gives a status. A separate synthetic file gives three fills on a ten-share order. The learner must explain how to read the customer’s own order and attribute the numbers from the example to that file.

One fresh coding agent started in an empty directory, wrote the missing passage, built the three-page site, and ran the lab ZIP downloaded from its own quickstart. Its first draft ranked first of three. The excerpt gave the read-only lookup by Alpaca order ID, explained zero and positive `filled_qty`, and assigned the three filled and seven canceled shares to the synthetic example. The unanswered prompt ranked second and the introduction third. The first result’s link opened the learner’s wording. The default example port was occupied. The learner used another port as the article instructed.

A separate trial held the heading, site and question fixed. Both a paragraph that gave the unidentified customer three fills and one that explained how to look up their own quantity ranked first. Only the latter met the exercise’s completion criteria. This is why the tutorial asks the author to read the returned passage and check each claim against the supplied evidence.

## From a browser draft to a fresh site

The review exercise uses [two recorded MCP excerpts](../public/passage-trial.json). A fresh reader used a keyboard at a 390px viewport to edit a copy of the first passage and compare it with the second. Both recorded passages kept their original rank. The reader copied their own paragraph from the editor.

We pasted that clipboard text under the ticket’s heading in a newly scaffolded three-page site. After the build, the downloaded search helper returned the reader’s paragraph first of three. Its citation opened the authored heading and `read_page` contained the copied Markdown. This replay covers one learner draft and one question.

The fresh build also exposed a preview-address mismatch. With `127.0.0.1` as the site URL, the HTML canonical used that host while MCP and the JSON page cited `localhost`. Setting `THALLY_SITE_URL` to `http://localhost:$PORT` before rebuilding made all three agree. The server still binds to loopback.
