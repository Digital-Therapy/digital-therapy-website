/**
 * Canonical tri-party Mutual NDA text (transcribed from Digital Therapy's signed
 * "NDA GMC" example), parameterized for Client · Digital Therapy · Vendor.
 * Shared by the public signing page (HTML review) and the server-side executed
 * PDF generator so the wording never diverges. Adjust wording here only.
 */

export const DT_ENTITY = {
  name: "Digital Therapy LLC",
  address: "115 East 89th Street, Apt. 9A, New York, NY 10128",
  signerName: "Jonathan Kobrin",
  signerTitle: "Owner",
  signerEmail: "jon@digitaltherapy.io",
};

export type NdaParties = {
  clientLegalName: string; // "Company"
  clientAddress: string;
  vendorCompany: string; // "Counterparty"
  vendorName: string;
  effectiveDate: string; // display string, e.g. "September 15, 2025"
};

export type NdaClause = { heading: string; body: string };
export type FilledNda = { title: string; intro: string; background: string[]; clauses: NdaClause[] };

export function fillNda(p: NdaParties): FilledNda {
  const company = p.clientLegalName || "the Company";
  const counterparty = p.vendorCompany || p.vendorName || "the Counterparty";
  return {
    title: "MUTUAL NON-DISCLOSURE AGREEMENT",
    intro:
      `This Mutual Non-Disclosure Agreement (this “Agreement”) is made effective as of ${p.effectiveDate || "the date of the last signature hereto"} ` +
      `(the “Effective Date”) by and between ${company} (“Company”), which has offices at ${p.clientAddress || "[address]"}, ` +
      `and ${DT_ENTITY.name}, with offices at ${DT_ENTITY.address}, and ${counterparty} (“Counterparty”). ` +
      `Each of Company and Counterparty is a “Party” and they are collectively referred to herein as the “Parties”.`,
    background: [
      `A. In connection with a business relationship in which ${DT_ENTITY.name} has been engaged by the Company to provide digital transformation services (the “Relationship”), the Parties may disclose or make available certain proprietary or confidential information or materials belonging to either Party, their affiliates or third parties for the purpose (the “Purpose”) of the Relationship.`,
      `B. The Parties desire to enter into this Agreement to prevent the unauthorized use and disclosure of such information and materials.`,
    ],
    clauses: [
      {
        heading: "1. Definition of Confidential Information",
        body:
          "“Confidential Information” means any and all materials or information not in the public domain that a Party (together with its affiliates, subsidiaries and assigns, the “Receiving Party”) acquires or learns from the other Party (together with its affiliates, subsidiaries and assigns, the “Disclosing Party”) in connection with the Purpose or any activities related thereto, whether disclosed or made available in writing, electronically, orally, visually or otherwise. Confidential Information of a Disclosing Party includes the Confidential Information of such Disclosing Party, its affiliates, its subsidiaries and third parties who have furnished Confidential Information to such Disclosing Party under an obligation of confidentiality. Confidential Information also includes all information in any form belonging to the Disclosing Party that is maintained in confidence by the Disclosing Party.",
      },
      {
        heading: "2. Non-Disclosure; Use Restrictions",
        body:
          "A Receiving Party shall hold the Confidential Information of the Disclosing Party in trust and confidence, shall not disclose such Confidential Information to any third party except as expressly authorized in writing by the Disclosing Party, and shall protect such Confidential Information using the same degree of care it uses to protect its own Confidential Information of similar value and sensitivity, but in no event less than reasonable care. A Receiving Party may disclose Confidential Information only to those of its employees and independent contractors participating in the Relationship or the Purpose who have a need to know, provided such persons are bound by terms no less restrictive than those contained in this Agreement. The Receiving Party shall not use the Confidential Information for any purpose except the Purpose, and shall take all reasonable precautions to ensure its employees and independent contractors comply with this Agreement.",
      },
      {
        heading: "3. Exclusions",
        body:
          "Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was rightfully known to the Receiving Party without restriction before disclosure by the Disclosing Party; (c) is rightfully received from a third party without restriction and without breach of any obligation of confidentiality; or (d) is independently developed by the Receiving Party without use of or reference to the Disclosing Party’s Confidential Information.",
      },
      {
        heading: "4. Compelled Disclosure",
        body:
          "If the Receiving Party is required by law, regulation or valid legal process to disclose any Confidential Information, it shall, to the extent legally permitted, give the Disclosing Party prompt prior written notice so the Disclosing Party may seek a protective order or other remedy, and shall disclose only that portion of the Confidential Information legally required to be disclosed.",
      },
      {
        heading: "5. No License",
        body:
          "Except as expressly provided herein or under a separate written agreement between the Parties that references this Agreement, neither Party grants, conveys or transfers to the other any interest, license or other right, whether by estoppel, implication or otherwise, in, to or under its Confidential Information or any patent, copyright, trade secret, trademark or other intellectual property right.",
      },
      {
        heading: "6. Return of Confidential Information",
        body:
          "Upon the earlier of (i) the completion or termination of the Relationship or (ii) the Disclosing Party’s written request, the Receiving Party shall promptly return or destroy all Confidential Information disclosed or made available by the other, in any form, including all copies, summaries and abstracts thereof; provided that (x) the Receiving Party’s legal department may retain one copy in a secure and confidential environment and (y) the Receiving Party need not delete Confidential Information from back-up systems or records retained to comply with law. Upon request, the Receiving Party shall certify in writing its compliance with this paragraph.",
      },
      {
        heading: "7. Term and Expiration",
        body:
          "This Agreement will remain in effect indefinitely from the Effective Date (the “Term”), unless superseded by another written agreement that specifically references this Agreement. The rights and obligations herein with respect to any Confidential Information disclosed or obtained during the Term shall continue and extend indefinitely from the date such Confidential Information is disclosed.",
      },
      {
        heading: "8. No Warranty",
        body:
          "ALL CONFIDENTIAL INFORMATION IS PROVIDED “AS-IS.” NO REPRESENTATIONS, WARRANTIES OR OTHER ASSURANCES ARE GIVEN BY THE DISCLOSING PARTY WITH RESPECT TO THE COMPLETENESS OR ACCURACY OF ANY INFORMATION.",
      },
      {
        heading: "9. Equitable Relief",
        body:
          "Each Party acknowledges that a breach of this Agreement may cause irreparable harm for which monetary damages would be inadequate, and that the non-breaching Party shall be entitled to seek injunctive relief to restrain any breach or threatened breach of this Agreement, or otherwise to specifically enforce any provision of this Agreement, without the necessity of posting a bond.",
      },
      {
        heading: "10. Miscellaneous",
        body:
          "This Agreement contains the entire understanding and agreement of the Parties relating to the subject matter hereof. No provision may be amended, modified or waived except in a writing signed by the Party sought to be bound. No custom or course of dealing shall modify this Agreement. Paragraph headings are for convenience only. The failure of either Party to enforce any provision shall not be a waiver of any rights. This Agreement is binding upon the Parties and their respective successors and assigns.",
      },
    ],
  };
}
