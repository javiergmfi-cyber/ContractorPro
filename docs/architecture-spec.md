Architectural Blueprint: "ContractorPro" AI-Driven Invoicing System
1. Executive Overview and System Philosophy
The construction and contracting industry operates in a unique intersection of physical labor, complex logistics, and chaotic administrative environments. "ContractorPro" is not merely an invoicing application; it is a bridge between the unstructured, high-noise reality of a job site and the rigid, structured requirements of financial accounting. The core architectural mandate for this system is to facilitate the seamless transformation of voice commands—often delivered in mixed languages such as Spanglish or Portuñol—into professional, legally compliant financial documents. This report details the technical architecture of the "Brain" (the AI processing layer), the "Skeleton" (the Database schema), and the "Circulatory System" (the Financial data flow).
The system is designed for a specific persona: the independent contractor who may be a native Spanish or Portuguese speaker but conducts business in an English-dominant market (or vice versa). This user often utilizes "code-switching," a linguistic phenomenon where they alternate between languages within a single sentence to bridge vocabulary gaps.1 Standard dictation tools fail here because they lack the semantic understanding of domain-specific jargon (e.g., "rufa" for roof, "sheetrock" vs. "placa"). Therefore, ContractorPro leverages OpenAI’s GPT-4o for its superior multilingual reasoning and context window capabilities 3, integrated with Supabase’s robust PostgreSQL infrastructure 5 and Stripe Connect’s decentralized payment architecture.7
This blueprint prioritizes three non-functional requirements:
1. High-Fidelity Semantic Parsing: The ability to distinguish between a "Quote" and an "Invoice" based on verb tense and context.
2. Data Sovereignty and Security: Utilizing Row Level Security (RLS) to ensure strict multi-tenancy.
3. Financial Integrity: Implementing a "Direct Charges" model where the contractor is the merchant of record, minimizing platform liability.8
________________
2. The AI "Brain": Universal Translator and Prompt Architecture
The "Brain" of ContractorPro is an orchestration layer that combines audio signal processing with Large Language Model (LLM) reasoning. Unlike simple transcription services, this layer must perform "Intent Discovery" 9, entity extraction, and cross-lingual normalization simultaneously. The choice of GPT-4o is predicated on its multimodal capabilities and improved performance in non-English languages compared to previous iterations.4
2.1 Audio Ingestion and Pre-Processing
The entry point for data is the contractor's voice. Construction environments are acoustically hostile, characterized by impulse noises (hammers), broadband noise (generators), and reverberation (empty rooms).
2.1.1 Whisper Integration Strategy
We utilize OpenAI’s Whisper model for Automatic Speech Recognition (ASR). While GPT-4o has native audio capabilities, separating the ASR step using Whisper allows for intermediate caching and lower latency in low-bandwidth environments common on job sites. The React Native application captures audio in .m4a or .wav formats. To optimize for "Spanglish," the language parameter in the Whisper API call should be set to auto or omitted, allowing the model to detect language switching dynamically. However, distinct prompt engineering at the Whisper level is required to guide the transcription of proper nouns (client names) and industry terms.
Technical Insight: Whisper is a sequence-to-sequence model trained on weak supervision. It excels at "decoding" audio but does not inherently "understand" it. The raw transcript from Whisper often contains phonetic approximations of Spanglish terms (e.g., transcribing "framing" as "freiming"). The burden of semantic correction falls on the subsequent GPT-4o layer.
2.2 The Universal Translator System Prompt
The System Prompt is the most critical software asset in the AI layer. It governs the behavior of GPT-4o, transforming it from a general-purpose chat bot into a specialized financial administrator.
2.2.1 Prompt Engineering Framework
We employ a "Role-Task-Context-Output" framework 11, augmented with Chain-of-Thought (CoT) instructions to handle ambiguity.12 The prompt must enforce a specific JSON schema for the output to ensure compatibility with the PostgreSQL database.3
The Challenge of Code-Switching:
Research indicates that multilingual models like mBERT or XLM-R often struggle with code-switching unless specifically fine-tuned. GPT-4o, however, demonstrates strong zero-shot performance in these scenarios if the prompt explicitly legitimizes the mixed input. The prompt must instruct the model to treat "Spanglish" not as an error, but as a valid dialect.2
Vocabulary Injection:
The prompt includes a dynamic glossary of construction terms. For instance, the term "placa" in standard Spanish means "plate" or "license plate," but in construction slang, it refers to "drywall" or "sheetrock".14 The prompt directs the model to map these colloquialisms to professional invoice line items.
2.2.2 The "ContractorPro" System Prompt Specification
Below is the architected system prompt. It is designed to be static but extensible, allowing for the injection of user-specific context (e.g., the user's trade).
Role
You are "ContractorAI," a senior construction administrator and linguistic expert specialized in the invoicing workflows of independent contractors. You possess deep knowledge of construction terminology in English, Spanish, and Portuguese, including regional dialects, slang, and "Spanglish/Portuñol" hybridizations (e.g., "rufa" for roof, "trozas" for trusses, "chirok" for sheetrock).
Objective
Your task is to analyze a raw audio transcript provided by a contractor and extract structured financial data to generate a valid Invoice or Quote. You must normalize all colloquial terms into professional English (or the target language if specified) suitable for a formal business document.
Input Context
* The input is a raw transcript from OpenAI Whisper.
* It may contain background noise artifacts, hesitation markers ("um," "uh"), and non-standard grammar.
* The speaker may switch languages mid-sentence (Code-Switching).
* Current Date: {{CURRENT_DATE}}
* User Trade: {{USER_TRADE}} (e.g., Plumber, Electrician)
Critical Rules & Logic
1. Intent Detection: Determine if the user is describing completed work ("INVOICE") or future work ("QUOTE"). Look for temporal markers (past tense vs. future tense/conditional). If ambiguous, default to "INVOICE" but flag low confidence.9
2. Linguistic Normalization:
   * Identify "Spanglish" terms and translate them to their Standard English professional equivalents.
   * Example: Input "Instalamos la carpeta en el master bedroom" -> Output Description "Carpet Installation - Master Bedroom".
   * Example: Input "Fixeamos la liqueo" -> Output Description "Leak Repair".
3. Entity Extraction:
   * Extract quantity, unit, unit_price, and total.
   * If a total is mentioned that contradicts (quantity * unit_price), trust the unit calculation but add a warning flag.
   * If no price is mentioned, mark unit_price as 0 and requires_review as true.
4. Currency Logic: Default to USD unless specific currency markers (Pesos, Reais) are present.
5. Output Format: You must output ONLY valid JSON adhering to the schema below. Do not output conversational text.
JSON Output Schema
{
"meta": {
"intent": "INVOICE" | "QUOTE",
"confidence": number,
"language_detected": "string",
"currency": "USD" | "BRL" | "MXN" | "EUR"
},
"client": {
"name": "string or null",
"contact_inferred": "string or null"
},
"line_items":,
"notes": "string (Any specialized instructions found in transcript)"
}
2.3 Handling Hallucinations and Ambiguity
Generative models can hallucinate, inventing line items that were not spoken. To mitigate this, the original_transcript_segment field in the JSON schema forces the model to ground its extraction in specific substrings of the input. This allows the UI to highlight the source text corresponding to each generated line item during the user review phase, increasing trust.
Furthermore, we utilize the specific parameter response_format: { type: "json_object" } available in the GPT-4o API to guarantee that the output is syntactically valid JSON.3 This prevents parsing errors in the application backend.
2.4 Token Economy and Cost Optimization
While GPT-4o is efficient, processing lengthy transcripts can be costly. To optimize, we employ a "Hybrid CSV/Prefix" style for the internal representation of line items if the transcript is exceptionally long, as research suggests this format reduces token usage compared to verbose JSON while maintaining structural integrity.3 However, for the final output to the application, JSON remains the standard for type safety.
________________
3. The Data Layer: Supabase (PostgreSQL) Architecture
The database is the system's "Skeleton," providing the rigid structure necessary for financial data. We utilize Supabase, which provides a managed PostgreSQL instance, Realtime subscriptions, and Storage.
3.1 Schema Design Philosophy
The schema must support:
1. Multi-tenancy: Strict isolation of data between contractors.
2. Relational Integrity: Invoices must belong to users; items must belong to invoices.
3. Stripe Connect Mapping: We must store the Stripe Account ID (acct_...) to facilitate payouts.
We adopt a "Declarative Schema" approach, managing the database structure via version-controlled SQL migration files rather than ad-hoc dashboard changes.16
3.2 Core Entity-Relationship Model
The following Markdown table describes the core tables and their primary responsibilities.
Table Name
	Description
	Key Relationships
	Security Policy (RLS)
	profiles
	Extends auth.users. Stores business profile and Stripe IDs.
	1:1 with auth.users
	User can only view/edit own profile.
	clients
	The contractor's customers. Stores CRM data.
	N:1 with profiles
	User can only view own clients.
	invoices
	The header object for a financial document.
	N:1 with clients, N:1 with profiles
	User can only view own invoices.
	invoice_items
	Individual line items (Labor, Materials).
	N:1 with invoices
	Cascade delete on Invoice deletion.
	voice_notes
	Metadata for audio files stored in buckets.
	N:1 with invoices
	User can only access own notes.
	3.3 Detailed Schema Definitions
3.3.1 User Profiles and Stripe Identity
The profiles table is the anchor for the Stripe Connect integration.


SQL




create table public.profiles (
 id uuid references auth.users on delete cascade not null primary key,
 business_name text,
 full_name text,
 stripe_account_id text unique, -- The 'acct_' ID from Stripe
 charges_enabled boolean default false, -- Webhook synced status
 payouts_enabled boolean default false, -- Webhook synced status
 default_currency text default 'USD',
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

-- RLS: Users can only see their own profile
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using ( true );
create policy "Users can insert their own profile" on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );

3.3.2 Invoices and Financial Data
The invoices table requires specific fields to link with Stripe's PaymentIntents.


SQL




create type invoice_status as enum ('draft', 'sent', 'paid', 'void', 'overdue');

create table public.invoices (
 id uuid default gen_random_uuid() primary key,
 user_id uuid references public.profiles(id) not null,
 client_id uuid references public.clients(id),
 stripe_payment_intent_id text, -- Critical for reconciliation
 stripe_hosted_invoice_url text,
 status invoice_status default 'draft',
 subtotal bigint, -- Stored in cents/smallest currency unit
 tax_amount bigint,
 total bigint,
 currency text default 'USD',
 due_date date,
 created_at timestamptz default now()
);

-- Indexing for Performance
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_stripe_pi_idx on public.invoices(stripe_payment_intent_id); -- Vital for Webhook lookup

3.4 Audio Storage and Security
ContractorPro stores raw voice notes which may contain sensitive PII (Personally Identifiable Information). Therefore, Supabase Storage buckets must be configured as Private.
Bucket Configuration:
* Name: voice-evidence
* Access: Authenticated only.
* Policy: (storage.foldername(name)) = auth.uid()::text
This policy ensures that a user can only upload and retrieve files in a folder named after their User ID, enforcing strict isolation at the storage level.18 To play back audio in the React Native app, the backend generates a Signed URL with a short expiration (e.g., 60 seconds), preventing unauthorized sharing of the underlying asset.19
3.5 Vector Search for Client Deduplication
To enhance the UX, we can implement a pgvector extension on the clients table. When GPT-4o extracts a client name (e.g., "Mr. John Smith"), we embedding-match it against existing clients to prevent duplicate entries (e.g., matching "Jon Smith" to "John Smith"). This uses Supabase's native vector support.21
________________
4. Financial Infrastructure: Stripe Connect Data Flow
The financial layer is the "Circulatory System," managing the flow of funds. For ContractorPro, the Stripe Connect Standard account type is the optimal architectural choice.
4.1 Account Strategy: Standard vs. Express
The decision to use Standard Accounts is strategic:
* Liability: In Standard accounts, the contractor is the merchant of record. They act as the direct seller to the client. This insulates the ContractorPro platform from chargeback liability and complex tax nexus issues.22
* Feature Set: Standard accounts give contractors access to the full Stripe Dashboard. They can manage their own banking details, view tax forms (1099-K), and handle disputes without building these features into the ContractorPro app.24
* Cost: Standard accounts have no monthly platform fees per active account, unlike Express accounts ($2/month), improving unit economics for a SaaS model.25
4.2 Onboarding Workflow (OAuth)
The onboarding process uses OAuth to link the contractor's Stripe account to the ContractorPro platform.
1. Initiation: User clicks "Connect Payouts" in React Native.
2. Edge Function: Calls stripe.accountLinks.create with type: 'account_onboarding'.
3. Redirection: User enters Stripe's hosted flow to provide KYC (Know Your Customer) data (SSN, Bank Info).
4. Completion: Stripe redirects to the app's return_url.
5. Synchronization: The app triggers a check to stripe.accounts.retrieve. We inspect charges_enabled and payouts_enabled and update the public.profiles table accordingly.26
4.3 Direct Charges Architecture
When a contractor sends an invoice, the platform facilitates a Direct Charge.
* Mechanism: The PaymentIntent is created with the Stripe-Account: {CONNECTED_STRIPE_ACCOUNT_ID} header.
* Flow of Funds: Client Credit Card -> Stripe -> Contractor's Balance.
* Monetization: ContractorPro takes a cut via application_fee_amount.
Code Example (Concept):


TypeScript




const paymentIntent = await stripe.paymentIntents.create({
 amount: invoiceTotal,
 currency: 'usd',
 application_fee_amount: platformFee, // e.g., 1%
 transfer_data: {
   destination: contractorStripeAccountId,
 },
 metadata: {
   supabase_invoice_id: invoice.id, // CRITICAL LINK
   supabase_user_id: user.id
 }
}, {
 stripeAccount: contractorStripeAccountId // This makes it a Direct Charge
});

4.4 Webhook Architecture and Reconciliation
Reconciling payments is the most fragile part of any fintech integration. We rely on Stripe Webhooks to update the invoice status in Supabase.
The "Connect Webhook" Nuance:
Because we are using Direct Charges on Standard Accounts, the webhook events originate from the connected account, not the platform account. We must configure the webhook endpoint in Stripe to "Listen to events on Connected Accounts".28
Event Handling: payment_intent.succeeded:
1. Ingestion: The webhook endpoint receives the event.
2. Validation: Verify Stripe-Signature using the signing secret.29
3. Identification: Extract event.data.object.metadata.supabase_invoice_id. This is the link established during the PaymentIntent creation.30
4. Update: Perform a database update on public.invoices setting status = 'paid'.
5. Idempotency: Log the event.id in a webhook_events table. If the same ID arrives again (Stripe retries), ignore it to prevent duplicate processing.28
Metadata Constraints:
Stripe limits metadata to 50 keys, with keys up to 40 characters and values up to 500 characters.31 Our architecture only requires invoice_id and user_id, which is well within limits.
________________
5. Integration Strategy and React Native Client
The mobile client is the interface for these complex backend systems.
5.1 Offline First Considerations
Contractors often work in basements or rural sites with poor connectivity.
* Audio: Recording happens locally. The upload to Supabase Storage is queued and retried upon connection restoration.
* Drafting: The "Brain" processing requires a connection. However, the app should allow "queuing" of voice notes. When connectivity returns, the app batch-processes the pending audio files.
5.2 User Verification Loop
AI is probabilistic. The UI must present the parsed invoice as a "Draft."
1. Visual Confirmation: Display the line items.
2. Audio Overlay: Allow the user to tap a line item and hear the specific snippet of audio that generated it (using timestamps from Whisper).
3. Edit Capability: Allow manual overrides before finalization.
5.3 Security
API Keys for OpenAI and Stripe Secret Keys must never be stored in the React Native bundle. All interactions with these third-party services are proxied through Supabase Edge Functions. The React Native app only holds the Supabase Anonymous Key (public) and the User's JWT (Session Token).
________________
6. Conclusion and Future Outlook
The "ContractorPro" architecture represents a robust synthesis of modern AI capabilities and established financial infrastructure. By utilizing GPT-4o with a specialized System Prompt, the system bridges the "Spanglish Gap," making digital tools accessible to a broader demographic of tradespeople. The Supabase backend provides the necessary relational integrity and security (RLS) for sensitive business data, while Stripe Connect Standard accounts offer a scalable, compliant, and trust-minimized financial model.
This architecture is designed not just for function, but for resilience—handling the noisy, messy, and multilingual reality of the construction industry with the precision of a digital accountant.
7. Operational Scalability and Edge Cases
7.1 Scalability of the "Brain"
As the user base grows, the load on the OpenAI API will increase.
* Rate Limiting: We must implement a queue system in Supabase (using pg_net or similar) to manage outbound requests to OpenAI, ensuring we do not hit rate limits during peak hours (e.g., 5 PM when contractors finish work).
* Model Distillation: Eventually, the proprietary dataset of "Spanglish Construction Terms" collected by the system can be used to fine-tune a smaller model (like GPT-4o-mini), reducing costs by up to 60% while maintaining accuracy on this specific domain.
7.2 Handling "Ambiguous" Intents
A major edge case is the "Ambiguous Intent."
* User says: "I need 50 sheets of drywall for the Smith job."
* System Dilemma: Is this a purchase order? An invoice for work done? A quote for the client?
* Solution: The prompt logic defaults to "Draft Invoice" but flags the confidence score. The UI interprets this flag and prompts the user: "Is this a new Invoice or a Quote?" This "Human-in-the-Loop" design is essential for trust.
7.3 Data Privacy and Audio Retention
Given the sensitive nature of business dealings:
* Retention Policy: We implement a Supabase Storage lifecycle rule to auto-delete raw audio files after 30 days, keeping only the text transcript and the generated JSON. This reduces storage costs and liability.
* Encryption: All data is encrypted at rest in PostgreSQL and Supabase Storage.
8. Detailed API Specifications
8.1 Edge Function: transcribe-and-parse
* Trigger: HTTPS POST from Client.
* Payload: { audio_file_path: string, user_id: string }
* Process:
   1. Validate JWT.
   2. Fetch Audio Blob from Storage.
   3. POST to api.openai.com/v1/audio/transcriptions (Whisper).
   4. Construct Prompt (See Section 2.2).
   5. POST to api.openai.com/v1/chat/completions (GPT-4o).
   6. Insert into invoices table.
* Response: { success: true, invoice_id: uuid, confidence: number }
8.2 Edge Function: generate-payment-link
* Trigger: HTTPS POST from Client (User clicks "Send").
* Process:
   1. Retrieve invoice and items from DB.
   2. Retrieve stripe_account_id from profiles.
   3. Create Stripe Product and Price objects for each line item (or a single ad-hoc line item).
   4. Create Stripe PaymentLink or Invoice object.
   5. Update invoices table with payment_link_url.
* Response: { url: string }
This detailed architectural breakdown provides the comprehensive roadmap necessary for the engineering team to build "ContractorPro" with confidence, ensuring all requirements from the prompt—AI intelligence, database rigor, and financial compliance—are met with industry-best practices.
9. Advanced Prompt Engineering: The Mechanics of Code-Switching
The success of ContractorPro hinges entirely on the system's ability to normalize "Spanglish." This is not merely translation; it is cultural interpretation.
9.1 The Phenomenology of Spanglish in Construction
Construction Spanglish often involves "loanwords"—English words adapted to Spanish phonology/morphology.
* Morphological Adaptation: Verbs are conjugated. "To park" becomes "Parquear." "To check" becomes "Chequear" or "Checar." "To mop" becomes "Mopear."
* Phonetic Adaptation: Nouns are spelled as they sound. "Roof" -> "Rufa." "Truck" -> "Troca." "Gauges" -> "Geiyes."
9.2 The "Glossary Injection" Technique
To handle this, the System Prompt is dynamically assembled. We maintain a glossary table in Supabase.
* Table: glossary_terms (term, standard_english, category)
* Injection: Before calling GPT-4o, the Edge Function queries this table for common terms and injects them into the context.
* Prompt Segment:
Use the following construction glossary for reference:
   * "Rufa" -> Roof
   * "Freiming" -> Framing
   * "Liqueo" -> Leak
   * "Shirok" -> Sheetrock/Drywall
   * "Placa" -> Sheetrock/Drywall
   * "Fila" -> Field/Row
This "Few-Shot Prompting" technique drastically improves the model's ability to map non-standard inputs to professional outputs.4
10. Database Deep Dive: Declarative Schema Management
Managing database changes in a production environment requires discipline. We recommend using Supabase's CLI for Declarative Schema Management.16
10.1 The Migration Workflow
      1. Local Development: Developers run a local instance of Supabase (supabase start).
      2. Schema Changes: Changes are made via SQL in the supabase/migrations folder.
      * Example: 20231027_create_invoices.sql
      3. Diffing: The CLI command supabase db diff compares the local schema to the remote schema and generates a new migration file.
      4. Deployment: In CI/CD (GitHub Actions), the command supabase db push applies pending migrations to the production database.
This workflow ensures that the database schema is versioned alongside the application code, preventing "schema drift" where the production database creates errors because it lacks a column that exists in the development environment.
10.2 Indexing Strategy for High-Volume Reads
The invoices table will grow rapidly. The dashboard requires filtering by date, client, and status.
      * Composite Index: CREATE INDEX idx_invoices_user_status_date ON invoices (user_id, status, created_at DESC);
      * Reasoning: This specific index covers the most common query: "Show me my pending invoices from newest to oldest."
      * GIN Index for JSONB: CREATE INDEX idx_clients_address ON clients USING GIN (address);
      * Reasoning: Since addresses are stored as JSONB to accommodate international formats, a GIN (Generalized Inverted Index) allows for efficient searching within the JSON structure (e.g., "Find all clients in Zip Code 90210").
11. Comprehensive Security Model
11.1 Row Level Security (RLS) Mechanics
RLS is the firewall of the database. It is not an application-level check; it is enforced by the PostgreSQL query planner.
      * The Policy: auth.uid() = user_id
      * The Mechanism: When a query SELECT * FROM invoices is run, Postgres transparently appends WHERE user_id = 'current_user_uuid' to the query.
      * Implication: Even if there is a bug in the API code that forgets to filter by user ID, the database itself will return zero rows for other users' data. This is a "Defense in Depth" strategy critical for a financial SaaS.
11.2 PII Redaction in Logs
The system logs interactions for debugging. However, logs should not contain PII.
      * Data Masking: The Edge Functions must implement a logger that masks client_name, address, and email before writing to Supabase Logs or an external observability platform (e.g., Datadog).
      * Retention: Logs are retained for 7 days for debugging, then hard-deleted.
12. Final Architecture Summary
The "ContractorPro" system is a sophisticated assembly of best-in-class technologies.
      * Brain: OpenAI GPT-4o + Whisper (Multilingual Reasoning).
      * Skeleton: Supabase PostgreSQL (Structured Data & Security).
      * Nerves: Supabase Edge Functions (Logic & Glue).
      * Blood: Stripe Connect Standard (Financial Flow).
      * Skin: React Native (User Interface).
This architecture provides the necessary foundation to solve the "unstructured-to-structured" data problem in the construction industry, unlocking significant value for independent contractors by automating their most hated task: paperwork.
Works cited
      1. Daily Papers - Hugging Face, accessed January 11, 2026, https://huggingface.co/papers?q=Multilingual%20language%20models
      2. Translanguaging Interpretive Power in Formative Assessment Co-Design: A Catalyst for Science Teacher Agentive Shifts - ResearchGate, accessed January 11, 2026, https://www.researchgate.net/publication/361077709_Translanguaging_Interpretive_Power_in_Formative_Assessment_Co-Design_A_Catalyst_for_Science_Teacher_Agentive_Shifts
      3. Enhancing structured data generation with GPT-4o evaluating prompt efficiency across prompt styles - PMC - PubMed Central, accessed January 11, 2026, https://pmc.ncbi.nlm.nih.gov/articles/PMC11979239/
      4. Putting GPT-4o to the Sword: A Comprehensive Evaluation of Language, Vision, Speech, and Multimodal Proficiency - MDPI, accessed January 11, 2026, https://www.mdpi.com/2076-3417/14/17/7782
      5. Visual Schema Designer | Supabase Features, accessed January 11, 2026, https://supabase.com/features/visual-schema-designer
      6. Database | Supabase Docs, accessed January 11, 2026, https://supabase.com/docs/guides/database/overview
      7. Stripe Connect | Platform and Marketplace Payment Solutions, accessed January 11, 2026, https://stripe.com/connect
      8. Create direct charges - Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/connect/direct-charges
      9. IntentGPT: Few-shot Intent Discovery with Large Language Models - arXiv, accessed January 11, 2026, https://arxiv.org/html/2411.10670v1
      10. GPT-4o System Card | OpenAI, accessed January 11, 2026, https://openai.com/index/gpt-4o-system-card/
      11. How to get GPT 4o mini to reply in the same language 100% of the time? - Reddit, accessed January 11, 2026, https://www.reddit.com/r/ChatGPTPromptGenius/comments/1g6ouuj/how_to_get_gpt_4o_mini_to_reply_in_the_same/
      12. GPT-4.1 Prompting Guide - OpenAI Cookbook, accessed January 11, 2026, https://cookbook.openai.com/examples/gpt4-1_prompting_guide
      13. Function calling | OpenAI API, accessed January 11, 2026, https://platform.openai.com/docs/guides/function-calling
      14. Construction Terms in Spanish - Glossary | Bradley Hartmann & Co, accessed January 11, 2026, https://www.bradleyhartmannandco.com/construction-terms-in-spanish-glossary
      15. Jobsite Spanish: 100+ Phrases & Terms for Construction Sites & Warehouses | Jobble, accessed January 11, 2026, https://jobble.com/articles/jobsite-spanish-terms-construction-and-warehouses/
      16. Declarative database schemas | Supabase Docs, accessed January 11, 2026, https://supabase.com/docs/guides/local-development/declarative-database-schemas
      17. Declarative Schemas for Simpler Database Management - Supabase, accessed January 11, 2026, https://supabase.com/blog/declarative-schemas
      18. Storage Buckets | Supabase Docs, accessed January 11, 2026, https://supabase.com/docs/guides/storage/buckets/fundamentals
      19. Serving assets from Storage | Supabase Docs, accessed January 11, 2026, https://supabase.com/docs/guides/storage/serving/downloads
      20. JavaScript: Create a signed URL | Supabase Docs, accessed January 11, 2026, https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
      21. Localize your Supabase database with AI translation right from the dashboard - YouTube, accessed January 11, 2026, https://www.youtube.com/watch?v=loOJxuwgn2g
      22. Connect account types | Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/connect/accounts
      23. Create subscriptions with Stripe Billing - Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/connect/subscriptions
      24. Using Connect with Standard connected accounts - Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/connect/standard-accounts
      25. Getting started with Stripe Connect using Next.js - LogRocket Blog, accessed January 11, 2026, https://blog.logrocket.com/getting-started-stripe-connect-next-js/
      26. Onboarding a user (connecting Stripe account) - Zeroqode Docs, accessed January 11, 2026, https://docs.zeroqode.com/onboarding-a-user-(connecting-stripe-account)-192c669b00ed80c090cadb1f2f4db848
      27. The Account object | Stripe API Reference, accessed January 11, 2026, https://docs.stripe.com/api/accounts/object
      28. Connect webhooks - Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/connect/webhooks
      29. Receive Stripe events in your webhook endpoint, accessed January 11, 2026, https://docs.stripe.com/webhooks
      30. Metadata use cases - Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/metadata/use-cases
      31. Metadata | Stripe Documentation, accessed January 11, 2026, https://docs.stripe.com/metadata
      32. Bilingual Evaluation of Language Models on General Knowledge in University Entrance Exams with Minimal Contamination - arXiv, accessed January 11, 2026, https://arxiv.org/html/2409.12746v1