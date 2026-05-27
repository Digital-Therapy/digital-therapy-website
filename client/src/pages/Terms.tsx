/**
 * Digital Therapy Terms & Conditions page.
 * Long-form legal document. Cross-section references reflect the source
 * text exactly — please review for renumbering before publishing externally.
 */
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

function ClauseHeading({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-[#111111]">
      <span className="text-[#0A65FF]">{number}.</span> {children}
    </h2>
  );
}

const paragraphClass = "mt-4 text-base leading-7 text-black/85";
const bulletListClass = "mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-black/85 marker:text-[#0A65FF]";

export default function Terms() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        bookingContext="terms page family-office booking"
        contactContext="terms page navigation contact"
      />

      <main className="pt-20">
        <section className="bg-[#F7F4EE] py-20 lg:py-28">
          <div className="container max-w-4xl">
            <motion.div {...fadeUp}>
              <SectionLabel>Legal</SectionLabel>
              <h1 className="font-display text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.92] tracking-[-0.06em]">
                Terms &amp; Conditions
              </h1>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-black/55">
                Digital Therapy, LLC
              </p>
            </motion.div>

            <article className="mt-10 border-t border-black/10 pt-2">
              <ClauseHeading number="1">Applicability</ClauseHeading>
              <p className={paragraphClass}>
                These terms and conditions of sale (these &ldquo;Terms&rdquo;) are the only terms that govern the sale of services (&ldquo;Services&rdquo;) by Digital Therapy, a New York limited liability company (&ldquo;Seller&rdquo;) to the buyer named on the accompanying Statement of Work (&ldquo;Buyer&rdquo;). Notwithstanding anything herein to the contrary, if a written contract signed by both parties is in existence covering the sale of the Services covered hereby, the terms and conditions of said contract shall prevail to the extent they are inconsistent with these Terms.
              </p>
              <p className={paragraphClass}>
                The accompanying confirmation of sale (the &ldquo;Statement of Work&rdquo;), master services agreement (if applicable), and these Terms (collectively, this &ldquo;Agreement&rdquo;) comprise the entire agreement between the parties, and supersede all prior or contemporaneous understandings, agreements, negotiations, representations and warranties, and communications, both written and oral. These Terms prevail over any of Buyer&rsquo;s general terms and conditions of purchase regardless whether or when Buyer has submitted its purchase order or such terms. Fulfillment of Buyer&rsquo;s order does not constitute acceptance of any of Buyer&rsquo;s terms and conditions and does not serve to modify or amend these Terms.
              </p>

              <ClauseHeading number="2">Performance of Services</ClauseHeading>
              <p className={paragraphClass}>
                Seller shall use reasonable efforts to meet any performance dates to render the Services specified in the Statement of Work, and any such dates shall be estimates only.
              </p>
              <p className={paragraphClass}>With respect to the Services, Buyer shall:</p>
              <ul className={bulletListClass}>
                <li>cooperate with Seller in all matters relating to the Services and provide such access to Buyer&rsquo;s premises, and such office accommodation and other facilities as may reasonably be requested by Seller, for the purposes of performing the Services;</li>
                <li>respond promptly to any Seller request to provide direction, information, approvals, authorizations, or decisions that are reasonably necessary for Seller to perform Services in accordance with the requirements of this Agreement;</li>
                <li>provide such customer materials or information as Seller may reasonably request and Buyer considers reasonably necessary to carry out the Services in a timely manner and ensure that such customer materials or information are complete and accurate in all material respects; and</li>
                <li>obtain and maintain all necessary licenses and consents and comply with all applicable laws in relation to the Services before the date on which the Services are to start.</li>
              </ul>

              <ClauseHeading number="3">Non-Delivery</ClauseHeading>
              <p className={paragraphClass}>
                The quantity of any installment of Goods as recorded by Seller on dispatch from Seller&rsquo;s place of business is conclusive evidence of the quantity received by Buyer on delivery unless Buyer can provide conclusive evidence proving the contrary.
              </p>
              <p className={paragraphClass}>
                Seller shall not be liable for any non-delivery of Goods unless Buyer gives written notice to Seller of the non-delivery within 5 business days of the date when the Goods would in the ordinary course of events have been received.
              </p>
              <p className={paragraphClass}>
                Any liability of Seller for non-delivery of the Goods shall be limited to replacing the Goods within a reasonable time or adjusting the invoice respecting such Goods to reflect the actual quantity delivered.
              </p>
              <p className={paragraphClass}>
                Buyer acknowledges and agrees that the remedies set forth in Section 3 are Buyer&rsquo;s exclusive remedies for any non-delivery of Goods.
              </p>

              <ClauseHeading number="4">Quantity</ClauseHeading>
              <p className={paragraphClass}>
                If Seller delivers to Buyer a quantity of services of up to 15% more or less than the quantity set forth in the Statement of Work, Buyer shall not be entitled to object to or reject the services and shall pay for such services the price set forth in the Statement of Work adjusted pro rata.
              </p>

              <ClauseHeading number="5">Buyer&rsquo;s Acts or Omissions</ClauseHeading>
              <p className={paragraphClass}>
                If Seller&rsquo;s performance of its obligations under this Agreement is prevented or delayed by any act or omission of Buyer or its agents, subcontractors, consultants, or employees, Seller shall not be deemed in breach of its obligations under this Agreement or otherwise liable for any costs, charges, or losses sustained or incurred by Buyer, in each case, to the extent arising directly or indirectly from such prevention or delay.
              </p>

              <ClauseHeading number="6">Price</ClauseHeading>
              <p className={paragraphClass}>
                Buyer shall purchase the Services from Seller at the prices (the &ldquo;Prices&rdquo;) set forth in Seller&rsquo;s Statement of Work.
              </p>
              <p className={paragraphClass}>
                Buyer agrees to reimburse Seller for all reasonable travel and out-of-pocket expenses incurred by Seller in connection with the performance of the Services.
              </p>
              <p className={paragraphClass}>
                All Prices are exclusive of all sales, use, and excise taxes, and any other similar taxes, duties, and charges of any kind imposed by any Governmental Authority on any amounts payable by Buyer. Buyer shall be responsible for all such charges, costs and taxes; provided, that, Buyer shall not be responsible for any taxes imposed on, or with respect to, Seller&rsquo;s income, revenues, gross receipts, personal or real property, or other assets.
              </p>

              <ClauseHeading number="7">Payment Terms</ClauseHeading>
              <p className={paragraphClass}>
                Buyer shall pay deposit before any project may officially commence. Invoices must be paid within seven (7) days of receipt. Buyer shall make all payments hereunder in US dollars via the payment links provided to Buyer by Seller within each emailed invoice. Recurring billing is sometimes used for project terms greater than three (3) months. Auto-pay can be set up on a credit card or buyer can remit manually. Manual payments must be made within three (3) business days of the start of the next payment cycle.
              </p>
              <p className={paragraphClass}>
                Buyer shall pay interest on all late services that are more than 15 days past due at the rate of 1% per month or the highest rate permissible under applicable law, calculated daily and compounded monthly. Buyer shall reimburse Seller for all costs incurred in collecting any late payments, including, without limitation, attorneys&rsquo; fees. In addition to all other remedies available under these Terms or at law (which Seller does not waive by the exercise of any rights hereunder), Seller shall be entitled to suspend the delivery of any Goods or performance of any Services if Buyer fails to pay any amounts when due hereunder and such failure continues for 90 days following written notice thereof.
              </p>
              <p className={paragraphClass}>
                Buyer shall not withhold payment of any amounts due and payable by reason of any set-off of any claim or dispute with Seller, whether relating to Seller&rsquo;s breach, bankruptcy or otherwise.
              </p>

              <ClauseHeading number="8">Limited Warranty</ClauseHeading>
              <p className={paragraphClass}>
                Seller warrants to Buyer that it shall perform the Services using personnel of required skill, experience, and qualifications and in a professional and workmanlike manner in accordance with generally recognized industry standards for similar services and shall devote adequate resources to meet its obligations under this Agreement.
              </p>
              <p className={paragraphClass}>
                EXCEPT FOR THE WARRANTIES SET FORTH IN SECTION 8, SELLER MAKES NO WARRANTY WHATSOEVER WITH RESPECT TO THE GOODS OR SERVICES, INCLUDING ANY (a) WARRANTY OF MERCHANTABILITY; (b) WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE; (c) WARRANTY OF TITLE; OR (d) WARRANTY AGAINST INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS OF A THIRD PARTY; WHETHER EXPRESS OR IMPLIED BY LAW, COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OF TRADE, OR OTHERWISE.
              </p>
              <p className={paragraphClass}>
                SELLER MAKES NO REPRESENTATIONS OR WARRANTIES WITH RESPECT TO ANY THIRD-PARTY PRODUCT, INCLUDING ANY (a) WARRANTY OF MERCHANTABILITY; (b) WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE; (c) WARRANTY OF TITLE; OR (d) WARRANTY AGAINST INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS OF A THIRD PARTY; WHETHER EXPRESS OR IMPLIED BY LAW, COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OF TRADE, OR OTHERWISE.
              </p>
              <p className={paragraphClass}>
                THE SERVICES, PRODUCTS, SOFTWARE, HARDWARE AND ALL OTHER MATERIALS ARE PROVIDED &ldquo;AS IS&rdquo;, &ldquo;AS AVAILABLE&rdquo; AND &ldquo;WITH ALL FAULTS&rdquo;. BUYER AGREES AND ACKNOWLEDGES THAT SERVICE OUTAGES, SERVICE FAILURES, FAILURES OR DEFECTS IN SOFTWARE OR HARDWARE PROVIDED OR MADE AVAILABLE HEREUNDER, OR ERRORS IN PERFORMANCE OF ANY SUCH ITEMS, AND FAILURES OF THE PUBLIC INTERNET OR OTHER MEANS OF COMMUNICATION ARE NOT SELLER&rsquo;S RESPONSIBILITY. SELLER DOES NOT GUARANTEE CONTINUOUS, UNINTERRUPTED, OR SECURE ACCESS TO THE SERVICES, SOFTWARE OR HARDWARE OR ANY SYSTEMS PURSUANT TO WHICH BUYER ACCESSES SAME. SELLER IS NOT LIABLE FOR ANY DAMAGES OF ANY TYPE CAUSED BY SUCH INTERFERENCE. NO WARRANTY, REPRESENTATION, GUARANTEE, CONDITION, UNDERTAKING OR TERM, EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, AS TO THE CONDITION, QUALITY, DURABILITY, ACCURACY, COMPLETENESS, PERFORMANCE, OR QUIET ENJOYMENT, OR USE OF THE SERVICES, SOFTWARE, HARDWARE OR MATERIALS IS GIVEN OR ASSUMED BY SELLER AND ALL SUCH WARRANTIES, REPRESENTATIONS, CONDITIONS, UNDERTAKINGS AND TERMS ARE HEREBY EXCLUDED TO THE FULLEST EXTENT PERMITTED BY LAW, AS ARE ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE. SELLER DOES NOT WARRANT THAT DEFECTS IN THE SERVICES, SOFTWARE OR HARDWARE WILL BE CORRECTED.
              </p>

              <ClauseHeading number="9">Limitation of Liability</ClauseHeading>
              <p className={paragraphClass}>
                IN NO EVENT SHALL SELLER OR ITS AFFILIATED ENTITIES BE LIABLE TO BUYER OR ANY THIRD PARTY FOR ANY LOSS OF USE, REVENUE OR PROFIT OR LOSS OF DATA OR DIMINUTION IN VALUE, OR FOR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES WHETHER ARISING OUT OF BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE AND WHETHER OR NOT SELLER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING THE FAILURE OF ANY AGREED OR OTHER REMEDY OF ITS ESSENTIAL PURPOSE.
              </p>
              <p className={paragraphClass}>
                IN NO EVENT SHALL SELLER&rsquo;S OR ITS AFFILIATED ENTITIES&rsquo; AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER ARISING OUT OF OR RELATED TO BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, EXCEED THE LESSER OF THE TOTAL AMOUNTS PAID OR PAYABLE TO SELLER FOR THE SERVICES SOLD HEREUNDER FOR THE SIX MONTHS IMMEDIATELY PRECEDING THE DATE UPON WHICH THE CAUSE OF ACTION ARISES, IF ANY.
              </p>
              <p className={paragraphClass}>The limitation of liability set forth in Section 9 shall not apply to:</p>
              <ul className={bulletListClass}>
                <li>liability resulting from Seller&rsquo;s gross negligence or willful misconduct; and</li>
                <li>death or bodily injury resulting from Seller&rsquo;s acts or omissions.</li>
              </ul>

              <ClauseHeading number="10">Insurance</ClauseHeading>
              <p className={paragraphClass}>
                During the term of this Agreement and for a period of six months thereafter, each of Buyer and Seller shall, at its own expense, maintain and carry insurance in full force and effect which includes, but is not limited to, commercial general liability (including product liability) in a sum no less than $1,000,000 with financially sound and reputable insurers. Upon Seller&rsquo;s request, Buyer shall provide Seller with a certificate of insurance from Buyer&rsquo;s insurer evidencing the insurance coverage specified in these Terms. Buyer shall provide Seller with 15 days&rsquo; advance written notice in the event of a cancellation or material change in Buyer&rsquo;s insurance policy.
              </p>

              <ClauseHeading number="11">Compliance with Law</ClauseHeading>
              <p className={paragraphClass}>
                Buyer shall comply with all applicable laws, regulations, and ordinances. Buyer shall maintain in effect all the licenses, permissions, authorizations, consents, and permits that it needs to carry out its obligations under this Agreement.
              </p>

              <ClauseHeading number="12">Termination</ClauseHeading>
              <p className={paragraphClass}>
                In addition to any remedies that may be provided under these Terms, Seller may terminate this Agreement with immediate effect upon written notice to Buyer, if Buyer:
              </p>
              <ul className={bulletListClass}>
                <li>fails to pay any amount when due under this Agreement;</li>
                <li>has not otherwise performed or complied with any of these Terms, in whole or in part; or</li>
                <li>becomes insolvent, files a petition for bankruptcy or commences or has commenced against it proceedings relating to bankruptcy, receivership, reorganization, or assignment for the benefit of creditors.</li>
              </ul>
              <p className={paragraphClass}>
                Provided this Agreement has not been terminated by Seller as contemplated by the preceding paragraph, this Agreement will automatically terminate upon Seller&rsquo;s delivery of the final Good or performance of Services in accordance with this Agreement.
              </p>
              <p className={paragraphClass}>
                <span className="font-semibold">Termination for Convenience.</span> Either party may terminate this Agreement for convenience upon thirty (30) days&rsquo; prior written notice to the other party. In the event of termination for convenience, Buyer shall pay Seller for (i) all Services performed through the effective date of termination, (ii) any non-cancellable third-party costs or commitments incurred by Seller in connection with the Services prior to receipt of the termination notice, and (iii) any reasonable wind-down costs necessary to effectuate an orderly transition. Any deposits or prepaid amounts shall be applied first to amounts owing under clauses (i) through (iii), with any remaining balance refunded to Buyer. The provisions of Sections 10, 11, 14, 20, 21, 24, and 26 shall survive any termination of this Agreement.
              </p>

              <ClauseHeading number="13">Waiver</ClauseHeading>
              <p className={paragraphClass}>
                No waiver by Seller of any of the provisions of this Agreement is effective unless explicitly set forth in writing and signed by Seller. No failure to exercise, or delay in exercising, any right, remedy, power or privilege arising from this Agreement operates, or may be construed, as a waiver thereof. No single or partial exercise of any right, remedy, power or privilege hereunder precludes any other or further exercise thereof or the exercise of any other right, remedy, power, or privilege.
              </p>

              <ClauseHeading number="14">Confidential Information</ClauseHeading>
              <p className={paragraphClass}>
                All non-public, confidential or proprietary information of Seller, including but not limited to, specifications, samples, patterns, designs, plans, drawings, documents, data, business operations, customer lists, pricing, discounts, or rebates, disclosed by Seller to Buyer, whether disclosed orally or disclosed or accessed in written, electronic or other form or media, and whether or not marked, designated, or otherwise identified as &ldquo;confidential&rdquo; in connection with this Agreement is confidential, solely for the use of performing this Agreement and may not be disclosed or copied unless authorized in advance by Seller in writing. Upon Seller&rsquo;s request, Buyer shall promptly return all documents and other materials received from Seller. Seller shall be entitled to injunctive relief for any violation of this Section. This Section does not apply to information that is:
              </p>
              <ul className={bulletListClass}>
                <li>in the public domain;</li>
                <li>known to Buyer at the time of disclosure; or</li>
                <li>rightfully obtained by Buyer on a non-confidential basis from a third party.</li>
              </ul>

              <ClauseHeading number="15">Force Majeure</ClauseHeading>
              <p className={paragraphClass}>
                The Seller shall not be liable or responsible to Buyer, nor be deemed to have defaulted or breached this Agreement, for any failure or delay in fulfilling or performing any term of this Agreement when and to the extent such failure or delay is caused by or results from acts or circumstances beyond the reasonable control of Seller including, without limitation, acts of God, flood, fire, earthquake, explosion, governmental order or actions, war, invasion, or hostilities (whether war is declared or not), terrorist threats or acts, riot, or other civil unrest, national emergency, revolution, insurrection, epidemic, lockouts, strikes or other labor disputes (whether or not relating to either party&rsquo;s workforce), or restraints or delays affecting carriers or inability or delay in obtaining supplies of adequate or suitable materials, materials or telecommunication breakdown or power outage, provided that, if the event in question continues for a continuous period in excess of 90 days, Buyer shall be entitled to give notice in writing to Seller to terminate this Agreement.
              </p>

              <ClauseHeading number="16">Assignment</ClauseHeading>
              <p className={paragraphClass}>
                Buyer shall not assign any of its rights or delegate any of its obligations under this Agreement without the prior written consent of Seller. Any purported assignment or delegation in violation of this Section is null and void. No assignment or delegation relieves Buyer of any of its obligations under this Agreement.
              </p>

              <ClauseHeading number="17">Relationship of the Parties</ClauseHeading>
              <p className={paragraphClass}>
                The relationship between the parties is that of independent contractors. Nothing contained in this Agreement shall be construed as creating any agency, partnership, joint venture or other form of joint enterprise, employment or fiduciary relationship between the parties, and neither party shall have authority to contract for or bind the other party in any manner whatsoever.
              </p>

              <ClauseHeading number="18">No Third-Party Beneficiaries</ClauseHeading>
              <p className={paragraphClass}>
                This Agreement is for the sole benefit of the parties hereto and their respective successors and permitted assigns and nothing herein, express or implied, is intended to or shall confer upon any other person or entity any legal or equitable right, benefit, or remedy of any nature whatsoever under or by reason of these Terms.
              </p>

              <ClauseHeading number="19">No Affiliate Liability</ClauseHeading>
              <p className={paragraphClass}>
                No affiliates of Digital Therapy, LLC accepts liability for the work or advice which Seller provides to its clients, including Buyer. Buyer acknowledges and accepts that such firms, networks, and associations do not owe Buyer any duty in relation to the work or advice which Seller will from time to time provide to Buyer or is required to provide to Buyer.
              </p>
              <p className={paragraphClass}>Digital Therapy&rsquo;s list of affiliates includes the following companies:</p>
              <ul className={bulletListClass}>
                <li>Atkins CPA</li>
                <li>AME</li>
                <li>Pilot House Payments</li>
                <li>Wilson Park Group</li>
                <li>Corner Edge Solutions, LLC</li>
                <li>Nice Hustle</li>
              </ul>

              <ClauseHeading number="20">Governing Law</ClauseHeading>
              <p className={paragraphClass}>
                All matters arising out of or relating to this Agreement are governed by and construed in accordance with the internal laws of the State of New York without giving effect to any choice or conflict of law provision or rule (whether of the State of New York or any other jurisdiction) that would cause the application of the laws of any jurisdiction other than those of the State of New York.
              </p>

              <ClauseHeading number="21">Submission to Jurisdiction</ClauseHeading>
              <p className={paragraphClass}>
                Any legal suit, action, or proceeding arising out of or relating to this Agreement shall be instituted in the federal courts of the United States of America or the courts of the State of New York in each case located in the City of New York and County of New York, and each party irrevocably submits to the exclusive jurisdiction of such courts in any such suit, action, or proceeding. Buyer and Seller, to the extent permitted by law, each knowingly, voluntarily and intentionally waive the right to a trial by jury in any action arising out of or relating to this Agreement or the Goods or Services to be provided or performed, as applicable, by Seller pursuant hereto. This waiver applies to any legal action or proceeding whether sounding in contract, tort, negligence or otherwise.
              </p>

              <ClauseHeading number="22">Notices</ClauseHeading>
              <p className={paragraphClass}>
                All notices, requests, consents, claims, demands, waivers, and other communications hereunder (each, a &ldquo;Notice&rdquo;) shall be in writing and addressed to the parties at the addresses set forth on the face of the Statement of Work or to such other address that may be designated by the receiving party in writing. All Notices shall be delivered by personal delivery, nationally recognized overnight courier (with all fees pre-paid), facsimile (with confirmation of transmission), email (with confirmation of transmission) to{" "}
                <a className="font-semibold text-[#0A65FF] underline" href="mailto:jon@digitaltherapy.io">
                  jon@digitaltherapy.io
                </a>{" "}
                or certified or registered mail (in each case, return receipt requested, postage prepaid). Except as otherwise provided in this Agreement, a Notice is effective only:
              </p>
              <ul className={bulletListClass}>
                <li>upon receipt of the receiving party, and</li>
                <li>if the party giving the Notice has complied with the requirements of this Section.</li>
              </ul>

              <ClauseHeading number="23">Severability</ClauseHeading>
              <p className={paragraphClass}>
                If any term or provision of this Agreement is invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other term or provision of this Agreement or invalidate or render unenforceable such term or provision in any other jurisdiction.
              </p>

              <ClauseHeading number="24">Survival</ClauseHeading>
              <p className={paragraphClass}>
                Provisions of these Terms which by their nature should apply beyond their terms will remain in force after any termination or expiration of this Agreement including, but not limited to, the following provisions: Insurance, Compliance with Laws, Confidential Information, Ownership of Work Product, Governing Law, Submission to Jurisdiction and Survival.
              </p>

              <ClauseHeading number="25">Amendment and Modification</ClauseHeading>
              <p className={paragraphClass}>
                These Terms may only be amended or modified in a writing stating specifically that it amends these Terms and is signed by an authorized representative of each party.
              </p>

              <ClauseHeading number="26">Ownership of Work Product</ClauseHeading>
              <p className={paragraphClass}>
                Subject to Buyer&rsquo;s full payment of all amounts due to Seller under this Agreement, Seller hereby assigns to Buyer all right, title, and interest in and to the deliverables specifically created by Seller for Buyer under this Agreement (the &ldquo;Work Product&rdquo;), including any designs, written materials, and custom code developed expressly for Buyer.
              </p>
              <p className={paragraphClass}>
                Notwithstanding the foregoing, Seller retains all right, title, and interest in and to (a) any pre-existing materials, tools, methodologies, templates, frameworks, software, or know-how owned or developed by Seller independently of this Agreement, whether before or during the term hereof (&ldquo;Seller Background IP&rdquo;), and (b) any general skills, knowledge, or experience gained by Seller in performing the Services. To the extent any Seller Background IP is incorporated into, or necessary for the use of, any Work Product, Seller grants Buyer a perpetual, non-exclusive, royalty-free, worldwide, non-transferable license to use such Seller Background IP solely as incorporated in the Work Product and solely for Buyer&rsquo;s internal business purposes.
              </p>
              <p className={paragraphClass}>
                Third-party materials, including but not limited to Wix accounts and templates, domain registrations, stock imagery, fonts, plug-ins, and third-party software, are governed by their respective third-party terms and licenses, and nothing in this Agreement shall be construed as an assignment or license of such third-party materials beyond what the applicable third-party terms permit. Seller will, upon Buyer&rsquo;s written request and at Buyer&rsquo;s expense (if any), cooperate in the transfer of ownership or administrative control of Buyer-specific third-party accounts (such as Wix accounts and domains registered in Buyer&rsquo;s name) following full payment.
              </p>
              <p className={paragraphClass}>
                During the term of this Agreement, and provided Buyer remains current on all amounts due and payable to Seller (including any amounts owed through the effective date of termination under Section 12), Buyer shall own all Work Product delivered by Seller in the ordinary course of the engagement. In the event of termination, ownership of Work Product delivered through the effective date of termination shall vest in Buyer upon Buyer&rsquo;s payment in full of all amounts due for such Work Product, including any amounts owing under Section 12. Any Work Product for which payment has not been received as of the effective date of termination remains the sole and exclusive property of Seller, and Buyer shall have no right to use, copy, modify, distribute, or exploit such unpaid Work Product. The assignment of Work Product set forth in this Section 26 shall be automatic and effective upon the applicable payment without the need for any further action by either party.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
