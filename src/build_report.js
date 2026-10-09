const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Footer,
  PageNumber, AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel, PageBreak,
} = require("docx");

const R = JSON.parse(fs.readFileSync("results.json")).results;
const SENS = JSON.parse(fs.readFileSync("results_sens.json"));
const PARAMS = JSON.parse(fs.readFileSync("results.json")).params;

const FONT = "Times New Roman";
const BLUE = "1F4FB0", DBLUE = "0A2A6B", BLACK = "000000";
const W = 9026; // content width, A4 with 1" margins

// ---------- helpers
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, size: o.size || 24, bold: o.bold, italics: o.italics, color: o.color || BLACK });
const P = (t, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.JUSTIFIED,
  spacing: { after: o.after === undefined ? 120 : o.after, before: o.before || 0, line: 276 },
  indent: o.indent, keepNext: o.keepNext,
  children: Array.isArray(t) ? t : [run(t, o)],
});
const H1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 280, after: 120 },
  children: [new TextRun({ text: t, font: FONT, size: 28, bold: true, color: DBLUE })],
});
const H2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, color: BLUE })],
});
const Cap = (t) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 },
  children: [run(t, { italics: true, size: 22 })],
});
const TCap = (t) => new Paragraph({
  alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 80 },
  children: [run(t, { italics: true, size: 22 })],
});
const bullets = (items) => items.map((t) => new Paragraph({
  numbering: { reference: "bul", level: 0 }, alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 60, line: 276 }, children: [run(t)],
}));
const fig = (file, w, h, caption) => [
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 },
    children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: w, height: h },
      altText: { title: caption, description: caption, name: file } })] }),
  Cap(caption),
];
const line = { style: BorderStyle.SINGLE, size: 4, color: BLACK };
const borders = { top: line, bottom: line, left: line, right: line };
function table(headers, rows, widths, o = {}) {
  const fs_ = o.size || 20;
  const cell = (t, w, head, align) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders,
    shading: head ? { type: ShadingType.CLEAR, fill: "DCE8FA", color: "auto" } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ alignment: align || AlignmentType.LEFT, spacing: { after: 0 },
      children: [run(String(t), { size: fs_, bold: head })] })],
  });
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, widths[i], true)) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], false, (o.center || []).includes(i) ? AlignmentType.CENTER : AlignmentType.LEFT)) })),
    ],
  });
}
const sp = () => P("", { after: 60 });
const pct = (k) => (100 * R[k][0]).toFixed(1);
const num = (k) => R[k][0].toFixed(1);

// ---------- content
const kids = [];

// ===== Title page
kids.push(P("Cyber Security (CA-2, Part 2): Case Study Report", { align: AlignmentType.CENTER, bold: true, color: DBLUE, size: 26, after: 40 }));
kids.push(P("B.Tech VII (CSE), Batch 2023-2027", { align: AlignmentType.CENTER, after: 600 }));
kids.push(P("GROUP NO. 22", { align: AlignmentType.CENTER, bold: true, size: 32, color: BLUE, after: 360 }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360, line: 300 },
  children: [new TextRun({ text: "Token Theft, Session Hijacking, and Conditional Access Bypass in Multi-Cloud Architectures: A Case Study of the Microsoft Midnight Blizzard Campaign", font: FONT, size: 36, bold: true, color: BLACK })] }));
kids.push(P("Group members", { align: AlignmentType.CENTER, bold: true, color: DBLUE, after: 100 }));
kids.push(new Table({
  width: { size: 7000, type: WidthType.DXA }, columnWidths: [900, 3600, 2500], alignment: AlignmentType.CENTER,
  rows: [
    ["Sr.", "Name", "PRN"], ["1", "Atharva More", "24070122508"], ["2", "Neel Khule", "24070122510"],
    ["3", "Tanmay Salunkhe", "24070122515"], ["4", "Velagala Prapul Reddy", "23070122232"],
  ].map((r, i) => new TableRow({ children: r.map((t, j) => new TableCell({
    width: { size: [900, 3600, 2500][j], type: WidthType.DXA }, borders,
    shading: i === 0 ? { type: ShadingType.CLEAR, fill: "DCE8FA", color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { after: 0 }, alignment: j === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [run(t, { bold: i === 0 })] })] })) })),
}));
kids.push(P("", { after: 500 }));
kids.push(P("Submitted: October 2026", { align: AlignmentType.CENTER, after: 0 }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// ===== Abstract
kids.push(H1("Abstract"));
kids.push(P("Most cloud logins today are protected by a password and a second factor, yet several recent intrusions show that attackers do not always have to beat either one. They take what the login produces, a session token, a refresh token or an OAuth grant, and use it as it is. This report studies the Midnight Blizzard (APT29) campaign against Microsoft's corporate email, disclosed in January 2024, together with the activity that followed it up to the CaptiveCrunch operation that Microsoft reported on 31 July 2026. We rebuild the attack chain from vendor disclosures, government advisories and SEC filings, map each stage to MITRE ATT&CK, and ask which control should have interrupted it. We then compare seven post-login control configurations in a synthetic simulator with four scenarios: replay from foreign hosting, replay through a residential proxy, OAuth app-only abuse and a cross-cloud pivot. In our model, country-based Conditional Access catches only the crudest replay, device-bound tokens stop roughly as many replays as there are bound sessions, and only a layered design with multi-cloud log correlation stays above 94% on every scenario, at the price of about 7% of legitimate sessions being blocked. The numbers come from synthetic data. They show how the control types behave relative to each other and are not measurements of any vendor's product."));
kids.push(P([run("Keywords: ", { bold: true }), run("token theft; session hijacking; Conditional Access; continuous access evaluation; OAuth abuse; multi-cloud identity; Midnight Blizzard; APT29")], { before: 60 }));

// ===== 1 Introduction
kids.push(H1("1. Introduction"));
kids.push(P("For a long time the usual advice after a phishing incident was to turn on multi-factor authentication (MFA). That advice is still sound, but it describes only the moment of sign-in. Once the user has proved who they are, the cloud service hands back a token, and from then on the token is the proof. Whoever holds it is treated as the user until it expires or is revoked. If an attacker can copy the token, or can talk a user into approving an application that receives one, the strong login has already been passed on someone else's behalf."));
kids.push(P("Microsoft's own investigation is a good illustration. In January 2024 the company said that a Russian state-sponsored actor it tracks as Midnight Blizzard, also known as NOBELIUM and APT29, had been inside its corporate email system [1]. The group got in with a password spray against a legacy, non-production test tenant account [43], then used OAuth applications to read mail belonging to senior leaders and to security and legal staff [3]. Hewlett Packard Enterprise said in an SEC filing days later that it believed the same actor had been taking data from its cloud mailboxes since May 2023 [9]. Government agencies then warned that the group was using stolen tokens and newly registered devices against cloud tenants [7], and in 2026 Microsoft linked a sub-cluster of the group to a campaign that steals browser cookies and Microsoft 365 single sign-on tokens from travellers on hotel Wi-Fi [5]."));
kids.push(P("We should be clear about what the public record does and does not say. The 2024 Microsoft intrusion is documented as a password spray followed by OAuth application abuse. It is not documented as a session-cookie theft. Token theft and session hijacking enter the story through the joint advisory on the group's cloud tactics [7], the device-code phishing that Microsoft attributes to the group since August 2024 [5], and the 2026 infostealer activity [5]. Our topic therefore covers the whole identity-token problem around this actor, with the 2024 incident as the anchor, and we say which technique belongs to which event as we go."));
kids.push(P("The word multi-cloud in the title matters too. Large organisations rarely live in one cloud. Entra ID may issue the tokens, while workloads run in AWS and Google Cloud and trust those tokens through federation [32], [33]. Each cloud has its own policy engine and its own idea of what a valid session is, so a control that works in one place can be invisible in the next."));
kids.push(H2("1.1 Research questions"));
kids.push(...bullets([
  "RQ1. How did the Midnight Blizzard chain work stage by stage, and which control should have interrupted each stage?",
  "RQ2. How do tokens and trust relationships carry this kind of attack from one cloud to another?",
  "RQ3. How do different classes of post-login control compare against token replay, and what do they cost in wrongly blocked users?",
]));
kids.push(H2("1.2 Contribution and structure"));
kids.push(P("We make three contributions. First, a sourced reconstruction of the campaign with each claim tied to a primary document where one exists. Second, a control-gap table that links every stage to a technique ID and to a preventive or detective control. Third, a small, open simulator that lets the reader see how seven control configurations behave under four token-abuse scenarios, with sensitivity runs for the two assumptions that matter most. Section 2 gives the background, Section 3 reviews the literature, Section 4 describes the case, Section 5 explains the methodology, Section 6 gives the case analysis, Section 7 covers implementation, Section 8 presents results and discussion, and Section 9 concludes."));

// ===== 2 Background
kids.push(H1("2. Background"));
kids.push(H2("2.1 Tokens, sessions and OAuth"));
kids.push(P("A web session is a semi-permanent exchange between a browser and a server, normally held together by a cookie [20]. Cloud APIs work in a similar way with OAuth 2.0 access and refresh tokens. A plain bearer token can be used by anyone who holds it, which is exactly the property that makes theft attractive [21]. The IETF has been tightening the surrounding practice: RFC 9700 collects the current best practice for OAuth security [22], and RFC 9449 defines DPoP, a way to bind a token to a key so that a copied token alone is useless [21]."));
kids.push(H2("2.2 Conditional Access and continuous evaluation"));
kids.push(P("In Microsoft Entra, Conditional Access policies decide at sign-in whether a request is allowed, based on signals such as user, location, device and risk. Before continuous access evaluation (CAE), clients simply replayed the cached access token until it expired. With CAE, services such as Exchange Online, SharePoint Online and Teams can react to critical events and policy changes in near real time; Microsoft documents latency of up to 15 minutes for critical events, while IP-location enforcement is instant [29]. A strict-location mode blocks tokens used outside the allowed network locations, but it only works well when egress addresses are dedicated and enumerable [30]."));
kids.push(H2("2.3 Adversary-in-the-middle phishing and device-code phishing"));
kids.push(P("In adversary-in-the-middle (AiTM) phishing a reverse proxy sits between the victim and the real site. The victim signs in, MFA succeeds, and the proxy keeps the session cookie. Microsoft stresses that this is not a flaw in MFA: the attacker simply replays the authenticated session [15]. Device-code phishing abuses a legitimate OAuth flow made for devices without a keyboard. The attacker starts the flow, persuades the victim to type the attacker's code into a genuine Microsoft page, and the victim ends up authenticating the attacker's session [5]."));
kids.push(H2("2.4 Federation across clouds"));
kids.push(P("Microsoft Entra can trust tokens issued by an external identity provider and exchange them for Entra access tokens, and Google Cloud can exchange AWS or Azure credentials for short-lived Google tokens [32], [33]. This removes long-lived keys, which is good, but it also means that trust is transitive. A credential that is accepted at one provider can be turned into access at another."));

// ===== 3 Literature review
kids.push(H1("3. Literature Review"));
kids.push(H2("3.1 Session and token security foundations"));
kids.push(P("Calzavara et al. surveyed the attacks that target web sessions and the defences proposed against them, and scored the defences on protection, usability, compatibility and ease of deployment [20]. They distil the survey into five guidelines for future defences. Fett, Küsters and Schmitz built a formal model of OAuth 2.0 and, while trying to prove it secure, found four attacks on the standard before proving that a fixed version holds [18]. More recently, Squarcina et al. tested cookie integrity protections such as SameSite and cookie prefixes across browsers and web frameworks, and found session-integrity problems in nine of the thirteen frameworks they analysed [19]. Taken together these papers explain why sessions leak even when the login is strong."));
kids.push(H2("3.2 Phishing kits that capture sessions"));
kids.push(P("Kondracki et al. were among the first to measure man-in-the-middle phishing toolkits in the wild. They found 1,220 such sites, and showed that only 43.7% of the associated domains and 18.9% of the IP addresses appeared on blocklists, which leaves a gap in the usual defences [17]. Microsoft's own telemetry describes a campaign against more than 10,000 organisations that used Evilginx2-based AiTM pages to steal sessions even where MFA was on [15], and a later multi-stage campaign against banks and financial services built on a phishing kit tracked as Storm-1167 [16]. These sources agree that the weak point is the session artefact and not the MFA prompt."));
kids.push(H2("3.3 Token forgery and theft in major incidents"));
kids.push(P("Three incidents are usually discussed together. In the SolarWinds campaign, CISA described abuse of SAML tokens, and security researchers explained how stealing a token-signing certificate lets an attacker forge assertions that bypass MFA [11], [12]. In 2023 the China-linked actor Storm-0558 used a signing key to forge tokens and read mail at 22 organisations; the Cyber Safety Review Board concluded that the intrusion was preventable [10]. In late 2023, files uploaded to Okta's support system exposed HAR files containing session tokens, and Okta later said that sessions of five customers were hijacked [13], [14]. Midnight Blizzard sits next to these cases but uses a different route: valid accounts, OAuth applications and tokens obtained through the user [3], [7]."));
kids.push(H2("3.4 Standards and government guidance"));
kids.push(P("NIST SP 800-207 states the zero trust principle that no implicit trust is granted to assets or accounts based only on their network location [23]. The new SP 800-63B-4 recognises device-bound session credentials, adds requirements for browser cookies used for sessions, and describes session monitoring [24]. NIST and CISA published a draft of NIST IR 8587, Protecting Tokens and Assertions from Forgery, Theft, and Misuse, in late 2025 [25], and NIST announced the final version in September 2026 [26]. A Cloud Security Alliance note summarises its recommendations as shorter token lifetimes, sender-constrained tokens, working revocation and sufficient logging [27]."));
kids.push(H2("3.5 Gap"));
kids.push(P("Most of what we found treats one platform at a time: a vendor guide for Entra, a different one for AWS, another for Google. Public analysis of how a stolen token or a malicious OAuth application behaves across clouds is thin, and we did not find a published side-by-side comparison of control types on the same attack set. This report does not close that gap, since our data are synthetic, but it offers a transparent way to reason about it."));

// ===== 4 Case description
kids.push(H1("4. The Midnight Blizzard Case"));
kids.push(H2("4.1 Who the actor is"));
kids.push(P("MITRE describes APT29 as a group attributed to Russia's Foreign Intelligence Service (SVR) that has operated since at least 2008 [8]. Microsoft names it Midnight Blizzard and notes that other vendors track it as APT29, UNC2452 and Cozy Bear [3]. Microsoft describes its focus as long-running intelligence collection against governments, diplomatic bodies, NGOs and IT service providers, and says the actor is persistent and adept at abusing OAuth applications [5]."));
kids.push(H2("4.2 Timeline"));
kids.push(TCap("Table 1. Timeline of the campaign and related events (from public sources)"));
kids.push(table(["Date", "Event", "Source"], [
  ["May 2023", "HPE later says mailbox access and data theft began; SharePoint files taken", "[9]"],
  ["Late Nov 2023", "Password spray against a legacy, non-production test tenant account at Microsoft", "[43]"],
  ["12 Dec 2023", "HPE notified of suspected Midnight Blizzard access to its cloud email", "[9]"],
  ["12 Jan 2024", "Microsoft security team detects the attack; response process starts", "[1]"],
  ["19 Jan 2024", "Microsoft discloses the incident; HPE files an 8-K days later", "[1], [9]"],
  ["25 Jan 2024", "Microsoft publishes guidance for responders (OAuth apps, residential proxies)", "[3], [40]"],
  ["26 Feb 2024", "Joint advisory on SVR tactics for initial cloud access", "[7]"],
  ["8 Mar 2024", "Microsoft reports use of exfiltrated secrets, access to source code repositories; sprays up about 10x in Feb", "[2]"],
  ["2 Apr 2024", "CISA Emergency Directive 24-02 for US federal agencies", "[6]"],
  ["Aug 2024", "Device-code phishing by the group begins (per Microsoft's 2026 report)", "[5]"],
  ["22 Oct 2024", "Spear-phishing with signed RDP files to more than 100 organisations", "[4]"],
  ["Feb to Jul 2026", "AI-augmented device-code phishing; from May, CaptiveCrunch hotel Wi-Fi campaign; report on 31 Jul", "[5]"],
  ["15 Sep 2026", "NIST finalises IR 8587 on protecting tokens and assertions", "[26], [27]"],
], [1500, 6226, 1300], { size: 19 }));
kids.push(sp());
kids.push(H2("4.3 What happened inside Microsoft"));
kids.push(P("Microsoft says the attack was not the result of a vulnerability in its products, and that it saw no evidence at that time of access to customer environments, production systems, source code or AI systems [1]. The actor first compromised a legacy test tenant account through password spraying. Reports based on Microsoft's disclosure add that the account had no MFA [42]. From that foothold the actor found a legacy test OAuth application with elevated access to the corporate environment and used malicious OAuth applications to authenticate to Exchange Online and read corporate mailboxes [3]. Microsoft's guidance also notes that the group used residential proxy networks for its spray attempts [40]."));
kids.push(P("The story did not stop there. By March Microsoft reported that the group was using information taken from the emails to attempt further access, including access to some source code repositories and internal systems, and that spray volume in February was as much as ten times the January level [2], [44]. CISA added that the stolen mail contained authentication details exchanged between Microsoft and its customers, which is why it issued an emergency directive for federal agencies [6]."));
kids.push(H2("4.4 The 2024 to 2026 evolution"));
kids.push(P("The joint advisory of February 2024 describes four patterns: use of service and dormant accounts, token-based authentication that works without a password, enrolling new devices in the cloud tenant, and the use of password spraying and MFA fatigue to get past the first line of defence [7]. The October 2024 RDP campaign used lures about Microsoft, AWS and Zero Trust and went to thousands of users in over 100 organisations [4]. In 2026, according to Microsoft, a sub-cluster called Storm-2945 hijacked captive portals on hotel and conference networks, served fake updates, redirected some users into device-code sign-ins, and ran an infostealer that harvests browser cookies, saved passwords and Microsoft 365 SSO tokens, including refresh tokens and tokens from the Windows token broker cache. Microsoft also says the operators used AI for a significant portion of the work [5], [41]. The same blog describes earlier device-code phishing by a related sub-cluster [5], [46]."));

// ===== 5 Methodology
kids.push(H1("5. Methodology"));
kids.push(H2("5.1 Research design"));
kids.push(P("We used a single-case design with two parts. The first part is documentary analysis of the campaign, which answers RQ1 and RQ2. The second part is a controlled simulation of token abuse, which answers RQ3. We chose this mix for a practical reason. We have no access to Microsoft's or any other provider's telemetry, so we cannot measure how often a control fires on real traffic. What we can do is hold the attack set and the user population fixed and change only the control, so that differences in the results come from the controls and not from the data."));
kids.push(H2("5.2 Evidence collection and grading"));
kids.push(P("We searched for primary sources first: vendor incident disclosures, government advisories and directives, SEC filings, standards documents and product documentation. Trade press and research-blog summaries were used only to fill gaps or to check a detail, and each is labelled as such in the reference list. We graded evidence in three classes. Class A is a primary document from the affected party, a government body, a standards body or the vendor that built the control. Class B is a peer-reviewed paper or a reputable news report that quotes class A. Class C is anything else, and we avoided class C for factual claims. A claim about the campaign enters the report only if it appears in a class A source or in two independent class B sources. Where a figure comes from a single secondary source we say so in the text. Only sources up to 5 October 2026 are included, which is why the newest items are the July 2026 Microsoft report [5] and the September 2026 NIST publication [26]."));
kids.push(H2("5.3 Attack-chain decomposition and control-gap analysis"));
kids.push(P("We split the campaign into stages by the point at which the attacker gains a new capability: valid account, foothold application, privileged application, mailbox access, reuse of secrets. Each stage was mapped to MITRE ATT&CK technique IDs [8]. For every stage we then asked three questions. What evidence shows the stage happened? Which preventive control would have stopped it? Which detective control would have raised an alert quickly if prevention failed? The answers form Table 2 in Section 6 and every control named there is taken from vendor or government guidance, not from our own opinion."));
kids.push(H2("5.4 Multi-cloud trust model"));
kids.push(P("To address RQ2 we drew a simple model with two planes. The identity plane is where authentication, MFA and Conditional Access happen. The resource plane is where tokens are accepted: Exchange Online, an AWS role reached through OIDC federation, a Google Cloud workload identity pool. For each resource we recorded which checks are applied when the token is presented, using the product documentation for Microsoft [28], [29], [32] and Google [33]. Figure 1 shows the result. The point of the model is to locate the places where a stolen token is re-checked and the places where it is simply accepted."));
kids.push(...fig("fig2_multicloud.png", 560, 348, "Figure 1. Two-plane trust model and the four control points evaluated in this report."));
kids.push(H2("5.5 Simulation design"));
kids.push(P("The simulator is a short Python program that generates synthetic users and sessions, injects attack sessions, and checks each event against a set of control layers. Nothing in it touches a real tenant."));
kids.push(P([run("Population. ", { bold: true }), run(`We create ${PARAMS.n_users} users and ${PARAMS.sessions_per_user} sessions each, so ${PARAMS.n_users * PARAMS.sessions_per_user} legitimate sessions per run. Users have a home country, a home ISP, a mobile ISP, and 30% of them use a corporate VPN that exits in India. A legitimate session produces about ${PARAMS.events_legit} token uses spread over eight hours, split across Azure (60%), AWS (25%) and Google Cloud (15%). Normal life adds noise: 6% of events come from the mobile network, 15% of a VPN user's events go through the VPN, 1% come from an unfamiliar Wi-Fi network, and 3% of sessions take place entirely abroad on legitimate travel.`)]));
kids.push(P([run("Attack scenarios. ", { bold: true }), run(`We inject ${PARAMS.attack_sessions_per_scenario} sessions for each of four scenarios, with about ${PARAMS.events_attack} attacker requests each. S1 is replay of a stolen token from foreign hosting. S2 is replay through a residential proxy in the victim's own country with a copied user-agent; in half of the sessions the proxy sits on the victim's own ISP. S3 is OAuth app-only abuse, where a new application reads mail at a high rate and no user session exists. S4 is a cross-cloud pivot: the first 40% of requests replay the token against Azure, and the rest use AWS or Google Cloud from a rented server. These shapes follow the behaviours that the public reports describe [3], [5], [7] but the probabilities are our own assumptions.`)]));
kids.push(P([run("Control layers. ", { bold: true }), run("L0 is MFA at sign-in only. L1 is Conditional Access with a country allow-list, checked only when a sign-in or refresh happens. L2c is continuous evaluation with strict country enforcement, applied to Microsoft resources only. L2a is the same with an IP/ASN allow-list. L3 is device-bound tokens: a replayed token fails if the victim's session was bound. We assume 70% coverage, because Microsoft documents that token protection is limited to supported native applications and resources [28]. L4s scores each event on risk signals using one cloud's logs, and L4m does the same with logs from all three clouds. LAY combines L1, L2c, L3 and L4m, as a security team with all of them enabled would.")]));
kids.push(P([run("Risk score. ", { bold: true }), run("The L4 score adds weights for: ASN differs from the session origin (0.20), ASN never seen for the user (0.20), user-agent mismatch (0.20), unusual API client (0.25), request burst (0.25), a first-seen application (0.40) and country mismatch (0.15). An event scoring 0.60 or more is blocked. The threshold needs roughly three weak signals, so a single oddity such as a new hotel network does not trigger it.")]));
kids.push(P([run("Metrics. ", { bold: true }), run("For each layer and scenario we report the detection rate, which is the share of attack sessions blocked at least once, and the exposure, which is the mean number of attacker requests that succeeded before the first block. For legitimate sessions we report the false-block rate, which is the share of sessions with at least one wrongly blocked event. Each configuration is run with 30 different random seeds and we report the mean and the spread.")]));
kids.push(H2("5.6 Justification and threats to validity"));
kids.push(P("A simulator was the realistic choice for students without tenant-level telemetry, and it makes the comparison fair, but it has limits that readers should keep in mind. The scenario probabilities and score weights are assumptions, so absolute values should not be read as product performance. L3 detects as many replays as there are bound sessions because we built it that way; this follows from how proof of possession works [21], [28] and is not a discovery. The model also treats each control as perfectly configured and does not model attackers who adapt to a specific control. We therefore lean on the shape of the results and on the two sensitivity runs and avoid quoting single numbers as facts about the real world."));

// ===== 6 Case analysis
kids.push(H1("6. Case Analysis"));
kids.push(H2("6.1 Control-gap analysis (RQ1)"));
kids.push(...fig("fig1_chain.png", 600, 245, "Figure 2. Attack chain reconstructed from public reports, with ATT&CK technique IDs."));
kids.push(TCap("Table 2. Control-gap analysis of the Midnight Blizzard chain"));
kids.push(table(["Stage", "ATT&CK", "Control that should break it", "Detective control", "Src"], [
  ["1 Password spray on legacy test account", "T1110.003, T1078.004", "MFA on every account including test tenants; retire unused accounts", "Spray detection; sign-ins from residential-proxy ranges", "[1], [5], [42]"],
  ["2 Legacy test OAuth app with elevated access", "T1528, T1098", "Remove or lock down unused apps; least-privilege app permissions", "App governance alerts on privilege changes", "[3], [34]"],
  ["3 New malicious OAuth apps given high permissions", "T1098", "Admin consent workflow; restrict who can grant permissions", "Alerts on new apps with mail permissions", "[3], [31]"],
  ["4 Apps read executive mail", "T1114.002", "Scope app access to needed mailboxes; short-lived credentials", "Mailbox access auditing; anomalous token and app signals", "[3], [31]"],
  ["5 Secrets from mail used for new access", "T1078", "Never share credentials by email; rotate after exposure", "Alerts on use of rotated or known-leaked secrets", "[2], [6]"],
  ["6 Token replay and device registration (cloud advisory)", "T1528, T1098.005, T1621", "Token protection; phishing-resistant MFA; restrict device registration", "Anomalous token and attacker-in-the-middle detections", "[7], [28], [31]"],
  ["7 Device-code phishing and cookie theft (2024 to 2026)", "T1566, T1539, T1550", "Block device-code flow where unused; passkeys; device-bound cookies", "Risk-based sign-in policy; device-code anomaly alerts", "[5], [37]"],
], [1900, 1250, 2500, 2400, 976], { size: 17 }));
kids.push(sp());
kids.push(P("Two observations stand out. The first is that stage 1 had a plain, boring fix: the account lacked MFA [42], and the entire chain starts from that single gap. Stronger token controls do nothing for an account that was never protected. Microsoft's Secure Future Initiative responded partly along these lines. The company reported removing 730,000 unused apps from its production and productivity tenants in one pass [34], and its first progress report said that standard identity SDKs, which validate security tokens consistently, covered more than 73% of the tokens Entra ID issues for Microsoft applications [35]. The second observation is that stages 2 to 4 are about application identity, not user identity. A user-scoped control such as device binding does not apply to an application that authenticates with its own secret, so application lifecycle and permission review are separate work."));
kids.push(H2("6.2 Cross-cloud propagation (RQ2)"));
kids.push(P("Reading the Microsoft and Google documentation side by side shows how trust moves. Entra can accept tokens from an external identity provider through federated credentials and issue its own access tokens in exchange [32]. Google Cloud can exchange AWS or Azure credentials for short-lived Google tokens through a workload identity pool [33]. These mechanisms remove stored keys, which is an improvement. Their cost is that every provider evaluates the token with its own rules, and the strong checks described in Section 2, such as CAE and token protection, are documented for specific Microsoft services [28], [29]. After a token or credential has crossed into another cloud, we found no documentation suggesting that the original Conditional Access context travels with it. This is our reading of the documents, and an environment may add its own controls. If it is right, a replayed token that is blocked in Exchange Online may still be useful against a federated role elsewhere, and only a team that collects logs from all clouds in one place would see both halves of the story. Scenario S4 tests exactly this."));
kids.push(P("The same pattern appears in earlier incidents. In the Okta case, the stolen artefacts were session tokens in support files, and Okta's response included binding administrator session tokens to network location [14]. In Storm-0558, the artefact was a signing key, which let the actor mint tokens that services accepted [10]. In each case the useful object was something the system trusted without asking the user again."));

// ===== 7 Implementation
kids.push(H1("7. Implementation Details"));
kids.push(H2("7.1 Simulator implementation"));
kids.push(P(`The simulator is written in Python 3 with NumPy, in a single file of about 260 lines (token_replay_sim.py, supplied with this report). Users, sessions and attack sessions are plain dictionaries. Each control layer is a function that returns the index of the first blocked event in a session, or nothing. This lets us compute detection and exposure from the same call. A run uses a fixed random seed, seeds 1000 to 1029 are used for the main experiment and 10 seeds for each sensitivity setting, so any reader can reproduce our tables exactly. A full run, including the sensitivity settings, takes about three minutes in our environment. Table 3 lists the parameters.`));
kids.push(TCap("Table 3. Simulation parameters (main experiment)"));
kids.push(table(["Parameter", "Value", "Meaning"], [
  ["Users / sessions per user", `${PARAMS.n_users} / ${PARAMS.sessions_per_user}`, "Legitimate population"],
  ["Mean token uses per legitimate session", String(PARAMS.events_legit), "Poisson mean"],
  ["Attack sessions per scenario", String(PARAMS.attack_sessions_per_scenario), "S1 to S4"],
  ["Mean attacker requests per session", String(PARAMS.events_attack), "Poisson mean"],
  ["Mobile / VPN / other Wi-Fi event rates", `${PARAMS.p_mobile} / ${PARAMS.p_vpn} / ${PARAMS.p_other_wifi}`, "Legitimate network noise"],
  ["Legitimate travel sessions", String(PARAMS.p_travel), "Whole session abroad"],
  ["Device-bound sessions (coverage)", String(PARAMS.coverage), "Share of victims on supported clients"],
  ["Attacker triggers sign-in evaluation", String(PARAMS.p_refresh), "Relevant to L1"],
  ["Proxy on victim's own ISP", String(PARAMS.p_same_asn), "Relevant to S2 and S4"],
  ["Risk threshold", "0.60", "L4 blocks at or above this score"],
  ["Seeds", String(PARAMS.seeds), "Mean and spread reported"],
], [3700, 1700, 3626], { size: 19 }));
kids.push(sp());
kids.push(P("The core of the risk function is short enough to show here. It is a plain weighted sum, which makes it easy to explain and to change."));
const codeLines = [
  "def risk_score(e, s, u):",
  "    known = set(u['allowed_asn']) | {s['origin'][1]}",
  "    score = 0.0",
  "    if e['asn'] != s['origin'][1]:  score += 0.20",
  "    if e['asn'] not in known:       score += 0.20",
  "    score += 0.20*e['ua'] + 0.25*e['client']",
  "    score += 0.25*e['burst'] + 0.40*e['new_app']",
  "    if e['country'] != s['origin'][0]: score += 0.15",
  "    return score        # block when score >= 0.60",
];
kids.push(...codeLines.map((t, i) => new Paragraph({
  spacing: { after: 0, line: 252 }, indent: { left: 360 },
  shading: { type: ShadingType.CLEAR, fill: "EEF4FD", color: "auto" },
  children: [new TextRun({ text: t, font: "Courier New", size: 19, color: BLACK })],
})));
kids.push(sp());
kids.push(H2("7.2 Recommended control blueprint"));
kids.push(P("Alongside the simulator we compiled a configuration blueprint for a tenant that wants to harden against this class of attack. We did not deploy it in a live tenant, so Table 4 is a design derived from the vendor and government guidance cited, not a tested setup. The order follows the attack chain."));
kids.push(TCap("Table 4. Control blueprint mapped to the chain"));
kids.push(table(["#", "Control", "Setting or practice", "Stage", "Src"], [
  ["1", "MFA everywhere", "Enforce on all accounts including test and legacy tenants; phishing-resistant methods for admins", "1", "[5], [36], [42]"],
  ["2", "App hygiene", "Inventory OAuth apps; remove unused apps; review high-permission grants regularly", "2, 3", "[3], [34]"],
  ["3", "Token protection", "Require token protection for Exchange, SharePoint and Teams; start in report-only mode", "6", "[28]"],
  ["4", "Continuous evaluation", "Enable CAE; use strict location only where egress IPs are enumerable", "6", "[29], [30]"],
  ["5", "Device-code flow", "Block where not needed; otherwise constrain with Conditional Access", "7", "[5]"],
  ["6", "Risk policy", "Sign-in risk policy; investigate anomalous token and attacker-in-the-middle detections", "4, 6", "[31], [5]"],
  ["7", "Central logging", "Send Entra sign-in logs and AWS and Google audit logs to one SIEM; correlate by principal", "S4", "[32], [33]"],
  ["8", "Own applications", "Short token lifetimes, sender-constrained tokens (DPoP), working revocation", "6", "[21], [22], [26]"],
  ["9", "Browser sessions", "Prefer browsers with device-bound session credentials where available", "7", "[37], [38], [39]"],
  ["10", "Secret handling", "Do not email credentials; rotate any secret that has been mailed", "5", "[2], [6]"],
], [450, 1700, 4300, 900, 1676], { size: 18 }));
kids.push(sp());
kids.push(P("As an illustration of control 7 and of the detection idea behind L4, the query below looks for one token identifier used from more than one address. We wrote it from the documented log schema and did not run it against a live workspace, so it needs testing and tuning before use."));
const kql = [
  "union SigninLogs, AADNonInteractiveUserSignInLogs",
  "| where TimeGenerated > ago(1d) and ResultType == 0",
  "| summarize IPs = dcount(IPAddress), UAs = dcount(UserAgent),",
  "            Countries = dcount(tostring(LocationDetails.countryOrRegion))",
  "            by UserPrincipalName, UniqueTokenIdentifier",
  "| where IPs > 1 and (Countries > 1 or UAs > 1)",
];
kids.push(...kql.map((t) => new Paragraph({
  spacing: { after: 0, line: 252 }, indent: { left: 360 },
  shading: { type: ShadingType.CLEAR, fill: "EEF4FD", color: "auto" },
  children: [new TextRun({ text: t, font: "Courier New", size: 19, color: BLACK })],
})));
kids.push(sp());

// ===== 8 Results
kids.push(H1("8. Results and Discussion"));
kids.push(H2("8.1 Detection and false blocks"));
kids.push(P("Figure 3 and Table 5 show the main result. Each cell is the share of attack sessions that a control blocked at least once, averaged over 30 runs."));
kids.push(...fig("fig3_heatmap.png", 600, 327, "Figure 3. Detection rate by control layer and scenario, and false-block rate on legitimate sessions."));
const L = ["L0", "L1", "L2c", "L2a", "L3", "L4s", "L4m", "LAY"];
const LN = { L0: "L0 MFA at sign-in only", L1: "L1 Sign-in-time CA", L2c: "L2c CAE strict (country)", L2a: "L2a CAE strict (IP/ASN)", L3: "L3 Device-bound tokens", L4s: "L4s Analytics, one cloud", L4m: "L4m Analytics, all clouds", LAY: "LAY Layered" };
kids.push(TCap("Table 5. Detection % (mean over 30 seeds), mean attacker requests allowed before the first block, and false-block %"));
kids.push(table(["Layer", "S1 det", "S2 det", "S3 det", "S4 det", "S1 exp", "S2 exp", "S3 exp", "S4 exp", "FP %"],
  L.map((l) => [LN[l], ...["S1", "S2", "S3", "S4"].map((s) => pct(`${l}|${s}|det`)), ...["S1", "S2", "S3", "S4"].map((s) => num(`${l}|${s}|exp`)), pct(`${l}|FP`)]),
  [2226, 700, 700, 700, 700, 700, 700, 700, 700, 500], { size: 16, center: [1, 2, 3, 4, 5, 6, 7, 8, 9] }));
kids.push(sp());
kids.push(P("The run-to-run spread was small. The standard deviation of detection was below 6 percentage points for every cell and below 1 point for false blocks, so the ordering of the layers is stable."));
kids.push(...bullets([
  `F1. MFA alone stops nothing after sign-in. L0 detects 0% in every scenario and lets the attacker make about 25 requests. This matches the point Microsoft makes about AiTM: the session is already authenticated [15].`,
  `F2. Country-based Conditional Access is weak against anything but crude replay. L1 and L2c catch S1 (${pct("L1|S1|det")}% and ${pct("L2c|S1|det")}%) and nothing else, because a residential proxy in the victim's country passes a country check. Continuous evaluation helps with timing, not with this blind spot: L2c lets only ${num("L2c|S1|exp")} requests through in S1 against ${num("L1|S1|exp")} for L1.`,
  `F3. Tightening the location rule to IP or ASN catches more but hurts users. L2a reaches ${pct("L2a|S2|det")}% on S2, yet blocks ${pct("L2a|FP")}% of legitimate sessions, because people change networks. This agrees with Microsoft's note that strict enforcement needs well-understood network paths [30].`,
  `F4. Device-bound tokens are the cleanest control where they apply. L3 blocks ${pct("L3|S1|det")}% to ${pct("L3|S4|det")}% of replays with 0% false blocks, but it equals the coverage by construction and does nothing for S3. Coverage is the real constraint.`,
  `F5. Analytics see what binding cannot, if they have the right logs. L4s detects S3 completely but only ${pct("L4s|S4|det")}% of S4, since the AWS and Google events are invisible to it. L4m reaches ${pct("L4m|S4|det")}% on S4 for ${pct("L4m|FP")}% false blocks.`,
  `F6. Layering gives the best coverage and costs the most false blocks. LAY detects at least ${pct("LAY|S2|det")}% in every scenario with ${pct("LAY|FP")}% false blocks and ${num("LAY|S2|exp")} attacker requests on average in S2. Figure 4 shows the trade-off.`,
]));
kids.push(...fig("fig4_tradeoff.png", 540, 313, "Figure 4. Mean detection across the four scenarios against the false-block rate."));
kids.push(H2("8.2 Sensitivity"));
const c = SENS.coverage, q = SENS.p_same_asn;
kids.push(...fig("fig5_sens.png", 600, 273, "Figure 5. Sensitivity of scenario S2 to (a) device-binding coverage and (b) where the residential proxy sits."));
kids.push(P(`Panel (a) shows that L3 alone moves almost one for one with coverage, from ${(100 * c["0.3"]["L3|S2|det"][0]).toFixed(0)}% at 30% of sessions bound to ${(100 * c["0.9"]["L3|S2|det"][0]).toFixed(0)}% at 90%. The layered design degrades gently, from ${(100 * c["0.9"]["LAY|S2|det"][0]).toFixed(0)}% down to ${(100 * c["0.3"]["LAY|S2|det"][0]).toFixed(0)}%, because analytics cover the unbound sessions. Panel (b) shows why residential proxies are annoying. When the proxy never shares the victim's ISP, the IP/ASN list and the analytics detect all of S2. When it always does, L2a falls to ${(100 * q["1.0"]["L2a|S2|det"][0]).toFixed(0)}%, L4m to ${(100 * q["1.0"]["L4m|S2|det"][0]).toFixed(0)}%, and the attacker is allowed about ${q["1.0"]["L4m|S2|exp"][0].toFixed(0)} requests before an alert. Network-based features lose their power against a well-placed proxy. This is consistent with Microsoft's observation that the group used residential proxy networks [40]. The sensitivity runs use 10 seeds, so their values differ slightly from the main table.`));
kids.push(H2("8.3 Discussion"));
kids.push(P("The results support a fairly simple reading. Controls that look at the network, such as country or IP lists, only work against attackers who do not bother to hide. Controls that bind the token to a device remove the problem where they are available, and Microsoft documents that token protection is limited to supported native applications and some resources [28]. So the practical question is how much of an organisation's traffic is actually covered. Controls that look at behaviour fill the gaps but need good logs, and our S4 numbers show how much is lost when each cloud is watched separately."));
kids.push(P("The wider data point to the same direction. Microsoft's 2025 Digital Defense Report says more than 97% of identity attacks are password attacks, and that identity attacks rose 32% in the first half of 2025 [36]. One summary of the report puts token theft, AiTM and similar techniques together at under 3% of attacks [45]. Rare does not mean harmless, since the group in our case study uses exactly these methods against high-value targets, but it does mean that basic password and MFA hygiene still buys the most. For the Midnight Blizzard case specifically, the first-stage account in Microsoft's test tenant would have been protected by a basic MFA policy [42]. Our simulator does not model that, which is a reminder that some of the most effective measures are simple and unglamorous. The OAuth stages are outside what user-focused token controls address, and in S3 only the analytics layers caught the abuse. This lines up with the way Microsoft's response put weight on app hygiene and on tracking the group's use of OAuth applications [3], [34]."));
kids.push(P("The false-block figures matter as much as the detection figures. A security team that blocks 22% of legitimate sessions, as L2a does in our model, will soon be asked to switch the control off. The layered result of about 7% would also need tuning in practice, with step-up authentication in place of a hard block for borderline scores."));
kids.push(H2("8.4 Limitations"));
kids.push(P("The data are synthetic, scenario probabilities and score weights are our assumptions, and we did not model adaptive attackers, partial control misconfiguration, or user behaviour such as re-authenticating after a block. The control layers are abstractions of the documented behaviour of real features and not tests of them. We did not test any real Microsoft, AWS or Google service. Some sources are trade-press summaries of primary reports, and where the primary document was not available to us we used the secondary source and said so. Future work could replay anonymised sign-in data from a lab tenant, add DPoP-style binding for application tokens, and extend the cross-cloud model to AWS and Google Cloud policy engines."));

// ===== 9 Conclusion
kids.push(H1("9. Conclusion"));
kids.push(P("Midnight Blizzard shows that strong sign-in is not the end of the story. Microsoft's own incident began with an account that had no MFA, moved through OAuth applications and executive mailboxes, and reached into secrets that customers had emailed to Microsoft. Later activity by the same actor moved to device-code phishing and cookie and token theft, which go straight at the session. The public guidance now points the same way: bind tokens to devices, evaluate access continuously, keep application permissions tight, and watch all clouds together."));
kids.push(P("Our simulation adds a comparison of how the control types behave. In our model, country-based policies are easy to bypass, strict IP lists are too brittle for real users, device binding is excellent but limited by coverage, analytics need multi-cloud logs, and a layered design performs best at a manageable cost. These findings come from synthetic data and should be read as reasoning aids, not as measurements. We hope the open simulator and the control-gap table are useful to other students who want to repeat or challenge the analysis with real telemetry."));

// ===== References
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(H1("References"));
const refs = [
  "Microsoft Security Response Center, \"Microsoft actions following attack by nation state actor Midnight Blizzard,\" MSRC Blog, Jan. 19, 2024. [Online]. Available: https://msrc.microsoft.com/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard/",
  "Microsoft Security Response Center, \"Update on Microsoft actions following attack by nation state actor Midnight Blizzard,\" MSRC Blog, Mar. 8, 2024. [Online]. Available: https://msrc.microsoft.com/blog/2024/03/update-on-microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard/",
  "Microsoft Threat Intelligence, \"Midnight Blizzard: Guidance for responders on nation-state attack,\" Microsoft Security Blog, Jan. 25, 2024. [Online]. Available: https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/",
  "Microsoft Threat Intelligence, \"Midnight Blizzard conducts large-scale spear-phishing campaign using RDP files,\" Microsoft Security Blog, Oct. 29, 2024. [Online]. Available: https://www.microsoft.com/en-us/security/blog/2024/10/29/midnight-blizzard-conducts-large-scale-spear-phishing-campaign-using-rdp-files/",
  "Microsoft Threat Intelligence, \"CaptiveCrunch: Midnight Blizzard targets travelers worldwide for malware delivery and credential theft,\" Microsoft Security Blog, Jul. 31, 2026. [Online]. Available: https://www.microsoft.com/en-us/security/blog/2026/07/31/captivecrunch-midnight-blizzard-targets-travelers-worldwide-for-malware-delivery-and-credential-theft/",
  "Cybersecurity and Infrastructure Security Agency, \"ED 24-02: Mitigating the significant risk from nation-state compromise of Microsoft corporate email system,\" Apr. 2, 2024. [Online]. Available: https://www.cisa.gov/news-events/directives/ed-24-02-mitigating-significant-risk-nation-state-compromise-microsoft-corporate-email-system",
  "UK National Cyber Security Centre and international partners, \"SVR cyber actors adapt tactics for initial cloud access,\" joint advisory, Feb. 26, 2024. [Online]. Available: https://www.ncsc.gov.uk/news/svr-cyber-actors-adapt-tactics-for-initial-cloud-access",
  "MITRE, \"APT29, Group G0016,\" MITRE ATT&CK. [Online]. Available: https://attack.mitre.org/groups/G0016/ (accessed Oct. 5, 2026).",
  "Hewlett Packard Enterprise Co., \"Form 8-K, current report (date of earliest event: Jan. 19, 2024),\" U.S. Securities and Exchange Commission. [Online]. Available: https://www.sec.gov/Archives/edgar/data/1645590/000164559024000009/hpe-20240119.htm",
  "Cyber Safety Review Board, \"Review of the Summer 2023 Microsoft Exchange Online intrusion,\" U.S. Dept. of Homeland Security / CISA, Apr. 2024. [Online]. Available: https://www.cisa.gov/sites/default/files/2024-04/CSRB_Review_of_the_Summer_2023_MEO_Intrusion_Final_508c.pdf",
  "Cybersecurity and Infrastructure Security Agency, \"Advanced persistent threat compromise of government agencies, critical infrastructure, and private sector organizations,\" Alert AA20-352A, Dec. 2020 (updated Jan. 2021). [Online]. Available: https://www.cisa.gov/uscert/ncas/alerts/aa20-352a",
  "Dark Reading, \"SolarWinds campaign focuses attention on 'Golden SAML' attack vector.\" [Online]. Available: https://www.darkreading.com/cyberattacks-data-breaches/solarwinds-campaign-focuses-attention-on-golden-saml-attack-vector (accessed Oct. 5, 2026).",
  "Okta, \"Unauthorized access to Okta's support case management system: Root cause and remediation,\" Nov. 3, 2023. [Online]. Available: https://sec.okta.com/articles/2023/11/unauthorized-access-oktas-support-case-management-system-root-cause/",
  "BleepingComputer, \"Okta breach: 134 customers exposed in October support system hack,\" Nov. 3, 2023. [Online]. Available: https://www.bleepingcomputer.com/news/security/okta-breach-134-customers-exposed-in-support-system-hack/",
  "Microsoft Threat Intelligence, \"From cookie theft to BEC: Attackers use AiTM phishing sites as entry point to further financial fraud,\" Microsoft Security Blog, Jul. 12, 2022. [Online]. Available: https://www.microsoft.com/en-us/security/blog/2022/07/12/from-cookie-theft-to-bec-attackers-use-aitm-phishing-sites-as-entry-point-to-further-financial-fraud/",
  "Microsoft Defender Experts, \"Detecting and mitigating a multi-stage AiTM phishing and BEC campaign,\" Microsoft Security Blog, Jun. 8, 2023. [Online]. Available: https://www.microsoft.com/en-us/security/blog/2023/06/08/detecting-and-mitigating-a-multi-stage-aitm-phishing-and-bec-campaign/",
  "B. Kondracki, B. A. Azad, O. Starov, and N. Nikiforakis, \"Catching transparent phish: Analyzing and detecting MITM phishing toolkits,\" in Proc. ACM SIGSAC Conf. Computer and Communications Security (CCS), 2021, pp. 36-50, doi: 10.1145/3460120.3484765.",
  "D. Fett, R. Küsters, and G. Schmitz, \"A comprehensive formal security analysis of OAuth 2.0,\" in Proc. ACM SIGSAC Conf. Computer and Communications Security (CCS), 2016, pp. 1204-1215, doi: 10.1145/2976749.2978385.",
  "M. Squarcina, P. Adão, L. Veronese, and M. Maffei, \"Cookie crumbles: Breaking and fixing web session integrity,\" in Proc. 32nd USENIX Security Symposium, 2023. [Online]. Available: https://www.usenix.org/conference/usenixsecurity23/presentation/squarcina",
  "S. Calzavara, R. Focardi, M. Squarcina, and M. Tempesta, \"Surviving the web: A journey into web session security,\" ACM Computing Surveys, vol. 50, no. 1, pp. 1-34, 2017, doi: 10.1145/3038923.",
  "D. Fett et al., \"OAuth 2.0 demonstrating proof of possession (DPoP),\" IETF RFC 9449, Sep. 2023. [Online]. Available: https://datatracker.ietf.org/doc/rfc9449/",
  "T. Lodderstedt, J. Bradley, A. Labunets, and D. Fett, \"Best current practice for OAuth 2.0 security,\" IETF RFC 9700 (BCP 240), Jan. 2025. [Online]. Available: https://www.rfc-editor.org/info/rfc9700",
  "S. Rose, O. Borchert, S. Mitchell, and S. Connelly, \"Zero trust architecture,\" NIST Special Publication 800-207, Aug. 2020, doi: 10.6028/NIST.SP.800-207.",
  "National Institute of Standards and Technology, \"SP 800-63B-4: Digital identity guidelines, authentication and authenticator management (change log),\" 2025. [Online]. Available: https://pages.nist.gov/800-63-4/sp800-63b/changelog",
  "R. Galluzzo and A. Regenscheid, \"Protecting tokens and assertions from forgery, theft, and misuse (initial public draft),\" NIST IR 8587 ipd, 2025. [Online]. Available: https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8587.ipd.pdf",
  "National Institute of Standards and Technology, \"NIST finalizes guidelines on protecting online identity and access tokens from misuse,\" news release, Sep. 2026. [Online]. Available: https://nist.gov/news-events/news/2026/09/nist-finalizes-guidelines-protecting-online-identity-and-access-tokens",
  "Cloud Security Alliance, \"NIST and CISA finalize guidance on identity token theft,\" research note, Sep. 2026. [Online]. Available: https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/09/CSA_research_note_nist_cisa_token_theft_guidance_20260923-csa-styled.pdf",
  "Microsoft, \"Token protection in Microsoft Entra Conditional Access,\" Microsoft Learn. [Online]. Available: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-token-protection (accessed Oct. 5, 2026).",
  "Microsoft, \"Continuous access evaluation in Microsoft Entra,\" Microsoft Learn. [Online]. Available: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation (accessed Oct. 5, 2026).",
  "Microsoft, \"Strictly enforce location policies using continuous access evaluation,\" Microsoft Learn. [Online]. Available: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation-strict-enforcement (accessed Oct. 5, 2026).",
  "Microsoft, \"What are risk detections? (Microsoft Entra ID Protection),\" Microsoft Learn. [Online]. Available: https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-risks (accessed Oct. 5, 2026).",
  "Microsoft, \"Workload identity federation,\" Microsoft Learn. [Online]. Available: https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation (accessed Oct. 5, 2026).",
  "Google Cloud, \"Configure workload identity federation with AWS or Azure VMs,\" Google Cloud IAM documentation. [Online]. Available: https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds (accessed Oct. 5, 2026).",
  "Redmond Magazine, \"Microsoft SFI progress report,\" Sep. 26, 2024. [Online]. Available: https://redmondmag.com/articles/2024/09/26/microsoft-sfi-progress-report.aspx",
  "TechTarget, \"Microsoft issues first Secure Future Initiative report,\" 2024. [Online]. Available: https://www.techtarget.com/cybersecurity/news/366611385/Microsoft-issues-first-Secure-Future-Initiative-report",
  "The Record, \"Microsoft warns of a 32% surge in identity hacks, mainly driven by stolen passwords,\" 2025. [Online]. Available: https://therecord.media/microsoft-warns-of-surge-identity-hacks-passwords",
  "SecurityWeek, \"Google rolls out cookie theft protections in Chrome,\" Apr. 2026. [Online]. Available: https://www.securityweek.com/google-rolls-out-cookie-theft-protections-in-chrome/",
  "BleepingComputer, \"Google Chrome adds infostealer protection against session cookie theft,\" Apr. 2026. [Online]. Available: https://www.bleepingcomputer.com/news/security/google-chrome-adds-infostealer-protection-against-session-cookie-theft/",
  "W3C Web Application Security Working Group, \"Device Bound Session Credentials,\" draft specification. [Online]. Available: https://w3c.github.io/webappsec-dbsc/ (accessed Oct. 5, 2026).",
  "Infosecurity Magazine, \"Microsoft provides defense guidance after nation-state compromise,\" Jan. 29, 2024. [Online]. Available: https://www.infosecurity-magazine.com/news/microsoft-defense-guidance/",
  "Infosecurity Magazine, \"Midnight Blizzard targets travelers via captive portals,\" Aug. 3, 2026. [Online]. Available: https://www.infosecurity-magazine.com/news/captivecrunch-midnight-blizzard/",
  "Cybersecurity Dive, \"HPE issues breach notifications for 2023 Midnight Blizzard attack.\" [Online]. Available: https://cybersecuritydive.com/news/hpe-issues-breach-notifications-for-2023-midnight-blizzard-attack/739674",
  "Information Age (Australian Computer Society), \"How Russian hackers broke into Microsoft,\" 2024. [Online]. Available: https://ia.acs.org.au/article/2024/how-russian-hackers-broke-into-microsoft.html",
  "Microsoft Corp., \"Form 8-K, Exhibit 99.1: Update on Microsoft actions following attack by nation state actor Midnight Blizzard,\" U.S. Securities and Exchange Commission, Mar. 2024. [Online]. Available: https://www.sec.gov/Archives/edgar/data/789019/000119312524062997/d808756dex991.htm",
  "SOCRadar, \"Microsoft Digital Defense Report 2025: summary of identity attack trends.\" [Online]. Available: https://socradar.io/blog/microsoft-digital-defense-report-2025/",
  "Microsoft Threat Intelligence, \"Storm-2372 conducts device code phishing campaign,\" Microsoft Security Blog, Feb. 13, 2025. [Online]. Available: https://www.microsoft.com/en-us/security/blog/2025/02/13/storm-2372-conducts-device-code-phishing-campaign/",
];
refs.forEach((t, i) => kids.push(new Paragraph({
  alignment: AlignmentType.LEFT, spacing: { after: 70, line: 252 }, indent: { left: 520, hanging: 520 },
  children: [run(`[${i + 1}]  `, { size: 21 }), run(t, { size: 21 })],
})));
kids.push(P("All web sources were checked between 1 and 5 October 2026.", { before: 120, size: 21 }));

// ---------- document
const doc = new Document({
  creator: "Group 22", title: "Token Theft, Session Hijacking, and Conditional Access Bypass in Multi-Cloud Architectures",
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true, color: DBLUE }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 24, bold: true, color: BLUE }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: "bullet", text: "\u2022", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 540, hanging: 270 } }, run: { font: FONT } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: ["Group 22  |  Page ", PageNumber.CURRENT], font: FONT, size: 20, color: DBLUE })] })] }) },
    children: kids,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync("G22_report.docx", b); console.log("docx written"); });
