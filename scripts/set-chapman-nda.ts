/**
 * One-time: set Chapman Group's client-specific NDA document (the exact form the
 * client provided). Additive only — writes nda_template on our own dt_site.client
 * row. It does NOT delete or modify any NDA/signature records; reissuing a wrong
 * in-flight NDA is a separate, user-driven action ("Void & reissue" in the admin).
 *
 * Run:  npx tsx scripts/set-chapman-nda.ts
 * Safe to re-run (idempotent). Touches only our dt_site schema.
 */
import "dotenv/config";
import { getPool } from "../server/vendors";

const CHAPMAN_NDA = `MUTUAL NON-DISCLOSURE AGREEMENT

THIS AGREEMENT (this “Agreement”) is made effective as of the date of the last signature hereto (the “Effective Date”) by and between Garage Management Company LLC and Chapman Consulting LLC (“Company”), which has offices at 770 Lexington Avenue, 11th Floor, New York, NY 10065 and Digital Therapy LLC offices at 115 East 89th Street Apt. 9A New York, NY 10128, and [INSERT VENDOR] which has offices at [INSERT ADDRESS] (“Counterparty”). Each Company and Counterparty is a “Party” and are collectively referred to herein as the “Parties”.

Background

A. In connection with a business relationship where Digital Therapy LLC has been engaged by the Company to provide digital transformation services (the “Relationship”) the Parties may disclose or make available certain proprietary or confidential information or materials belonging to either Party, their affiliates or third parties for the purpose (the “Purpose”) of the Relationship.

B. The Parties desire to enter into this Agreement to prevent unauthorized use and disclosure of such information and materials.

Agreement

NOW, THEREFORE, the Parties, intending to be legally bound, hereby agree as follows:

1. Definition of Confidential Information. “Confidential Information” means any and all materials or information not in the public domain that a Party (together with its affiliates, subsidiaries and assigns, the “Receiving Party”) acquires or learns from the other Party (together with its affiliates, subsidiaries and assigns, the “Disclosing Party”) in connection with the Purpose or any activities related thereto, and whether disclosed or made available in writing, electronically, orally, visually or otherwise. For the purposes hereof, the Confidential Information of a Disclosing Party includes the Confidential Information of such Disclosing Party, its affiliates, its subsidiaries and third parties who have furnished Confidential Information to such Disclosing Party under an obligation of confidentiality or with whom such Disclosing Party otherwise deals. Confidential Information includes, without limitation, (i) software, utilities, solutions, designs, techniques, methods, methodologies, tools, processes, templates, data and any information related thereto, (ii) existing or contemplated products or services, specifications and plans, (iii) forecasts, business plans, strategies, and financial statements, records and information, (iv) customer lists or requirements, (v) details regarding divisions, revenues or volumes by region, by customer, by group, or by individual product, (vi) other business or technical information or trade secrets and (vii) the fact that discussions are taking place concerning the Purpose or the Relationship. The provisions of this Agreement shall apply to any Confidential Information that a Receiving Party receives or becomes privy to in connection with this Agreement, whether prior to, on or after the date of this Agreement. Confidential Information also includes all information in any form belonging to the Disclosing Party that is maintained in confidence by the Disclosing Party.

2. Non-Disclosure; Use Restrictions. The Parties anticipate that in connection with the Relationship and the Purpose or otherwise, either Party may receive or become privy to the Confidential Information of the other. A Receiving Party shall hold the Confidential Information of the Disclosing Party in trust and confidence, not disclose such Confidential Information to any third party except as expressly authorized in writing by the Disclosing Party and shall protect such Confidential Information by using the same degree of care as it uses to protect its own Confidential Information of similar value and sensitivity, but not less than reasonable care. A Receiving Party may disclose the Confidential Information of a Disclosing Party only to those of its employees and independent contractors who are participating in the Relationship or the Purpose who have a need to know such information, provided that such employees or independent contractors have signed an agreement containing terms no less restrictive than those contained in this Agreement. The Receiving Party shall not use the Confidential Information acquired or learned from the Disclosing Party for any purpose whatsoever, except for the Purpose or as contemplated under any other written agreement between the parties which references this Agreement. Each Receiving Party shall take all reasonable precautions to ensure that its employees and independent contractors comply with the provisions of this Agreement. For the avoidance of doubt, nothing in this Agreement restricts the Receiving Party’s ability to use general knowledge, skills, experience, or ideas retained in unaided memory, provided such knowledge, skills, experience, or ideas were not derived from Confidential Information in tangible form. Nothing in this Agreement shall preclude or in any way restrict any of the Parties or their respective affiliates from conducting their business operations or from investing or participating in any particular enterprise whether or not their business operations or such enterprise has products, services or technology which are similar to or competitive with those of the other Parties.

3. Exceptions. Notwithstanding the provisions of this Agreement, the obligations and restrictions set forth herein regarding Confidential Information shall not apply to information that the Receiving Party can establish (i) is or becomes publicly available other than as a result of a breach of this Agreement by, or other fault of, the Receiving Party, (ii) is lawfully received from a third party which is not under an obligation of confidentiality, (iii) was either in the possession of or known to the Receiving Party at the time of disclosure without any limitation on use or disclosure for the benefit of the Disclosing Party, or (iv) as shown by written records, is independently developed by the Receiving Party without the use, reference to or benefit of the Disclosing Party’s Confidential Information.

4. Disclosures Required by Law. A Receiving Party shall not be restricted from disclosing Confidential Information as required pursuant to any law, regulation or judicial or governmental order, provided that any such disclosure shall be limited to the extent of the legal requirement and the Receiving Party shall, except if prohibited by law, regulation or judicial or governmental order, promptly notify the Disclosing Party and cooperate with the Disclosing Party, at the Disclosing Party’s expense, so that it may intervene and object to such disclosure or seek a protective order or other appropriate protection.

5. Ownership; No License. All materials and Confidential Information shall remain the exclusive property of the Disclosing Party (or the affiliate or third party from which the Disclosing Party obtained such materials or Confidential Information). Except as expressly provided herein or under a separate written agreement between the Parties that references this Agreement, neither Party grants, conveys or transfers to the other any interest, license or other right, whether by estoppel, implication or otherwise, in, to or under its Confidential Information or any patent, copyright, trade secret, trademark or other intellectual property right.

6. Return of Confidential Information. Upon the earlier of (i) the completion or termination of the Relationship or (ii) the Disclosing Party’s written request, the Receiving Party shall promptly return or destroy all Confidential Information disclosed or made available by the other, in any form and including, without limitation, all copies, summaries and abstracts thereof; provided that (x) Receiving Party’s legal department may retain one copy of the Confidential Information in a secure and confidential environment and (y) Receiving Party shall not be required to delete Confidential Information from its back-up computer systems, tapes or such records retained to comply with any law, rule or regulation. Upon request, the Receiving Party shall certify in writing that it has complied with the provisions of this paragraph 6.

7. Term and Expiration. This Agreement will remain in effect indefinitely from the Effective Date (the “Term”), unless this Agreement is superseded by another written agreement that specifically references this Agreement. The rights and obligations contained in this Agreement with respect to any Confidential Information disclosed or obtained during the Term of the Agreement shall continue and extend indefinitely from the date on which such Confidential Information is disclosed.

8. No Warranty; Obligations. ALL CONFIDENTIAL INFORMATION IS PROVIDED “AS-IS”. NO REPRESENTATIONS, WARRANTIES OR OTHER ASSURANCES ARE GIVEN BY THE DISCLOSING PARTY WITH RESPECT TO THE COMPLETENESS OR ACCURACY OF ANY INFORMATION OR MATERIALS PROVIDED TO THE RECEIVING PARTY. Except for the obligations of the Parties specifically set forth in this Agreement, neither Party shall have any obligation to enter into any discussions or agreement with respect to any transaction related to the Relationship or otherwise have any obligation with respect to any such transaction. Any obligations relating to the Relationship in addition to those contained herein, if any, shall be set forth in one or more separate written agreements between the Parties.

9. Governing Law; Remedies. This Agreement, including, without limitation, the performance and enforceability hereof, shall be governed by and construed in accordance with the laws of the State of New York. Each Receiving Party acknowledges that a violation of this Agreement by the Receiving Party may cause irreparable harm to the Disclosing Party and that the Disclosing Party may have no adequate remedy at law. Accordingly, each Party agrees that the Disclosing Party shall have the right, in addition to any other rights and remedies it may have, at law, in equity or otherwise, to seek injunctive relief in any court of competent jurisdiction to restrain any breach or threatened breach of this Agreement or otherwise to specifically enforce any provision of this Agreement.

10. Miscellaneous. This Agreement contains the entire understanding and agreement of the Parties relating to the subject matter hereof. No provision of this Agreement may be amended, modified or waived except in a writing signed by the Party sought to be bound. No custom or course of dealing shall cause a modification of this Agreement. The paragraph headings used herein are for convenience of reference only and will not affect the interpretation or construction of this Agreement. The failure of either Party to enforce any provision of this Agreement shall not constitute a waiver of any rights or remedies available to such Party or its right to subsequently enforce such provision or any other provision of this Agreement. This Agreement shall be binding upon the Parties and their respective successors and assigns.

IN WITNESS WHEREOF, the Parties hereto have executed this Agreement as of the date first written above.`;

async function main() {
  const pool = getPool();
  if (!pool) {
    console.error("No portal DB pool — is PORTAL_DATABASE_URL set in .env?");
    process.exit(1);
  }
  // Make sure the column exists (idempotent) without depending on app boot order.
  await pool.query(`ALTER TABLE dt_site.client ADD COLUMN IF NOT EXISTS nda_template text`);

  const found = await pool.query(
    `SELECT id, name FROM dt_site.client WHERE name ILIKE '%chapman%' ORDER BY id`,
  );
  if (found.rows.length === 0) {
    console.error("No client matching '%chapman%' found. Existing clients:");
    const all = await pool.query(`SELECT id, name FROM dt_site.client ORDER BY name`);
    for (const c of all.rows) console.error(`  [${c.id}] ${c.name}`);
    process.exit(1);
  }
  for (const c of found.rows) {
    await pool.query(`UPDATE dt_site.client SET nda_template = $2 WHERE id = $1`, [c.id, CHAPMAN_NDA]);
    console.log(`Set client-specific NDA for [${c.id}] ${c.name} (${CHAPMAN_NDA.length} chars).`);

    // Report (do NOT delete) any already-sent NDA that predates this template so
    // you know which to reissue from the admin via "Void & reissue".
    const ndas = await pool.query(
      `SELECT id, vendor_application_id, status FROM dt_site.vendor_nda WHERE client_id = $1 AND status <> 'pending'`,
      [c.id],
    );
    for (const n of ndas.rows) {
      console.log(
        `  NOTE: NDA #${n.id} (vendor ${n.vendor_application_id}, status '${n.status}') was issued on the OLD document. Reissue it from the admin ("Void & reissue") to use the new wording.`,
      );
    }
  }
  await pool.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
