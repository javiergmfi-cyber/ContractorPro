UX Architecture Report: Transforming ContractorPro via Apple Human Interface Guidelines
Executive Summary: The Evolution from Utility to Experience
In the contemporary mobile ecosystem, particularly within the iOS environment, the distinction between a functional utility and a premier user experience has become the primary competitive differentiator. "ContractorPro," currently characterized by a "cluttered, robotic feel," suffers from a common ailment in financial software: the prioritization of raw data exposition over cognitive clarity. Users, specifically independent contractors and freelancers, do not view their invoicing applications merely as databases; they view them as the digital nervous system of their livelihood. The "robotic" quality stems from a lack of anticipation—the app waits for input rather than guiding the user—and a visual rigidity that ignores the fluid, organic physics inherent to modern iOS design.
This report serves as a comprehensive UX architecture session, aiming to dismantle the legacy spreadsheet mental model and replace it with an object-oriented, tactile financial experience. By rigorously applying Apple’s Human Interface Guidelines (HIG) and leveraging the latest capabilities of iOS 17 and 18, we will redefine the core pillars of the application: the Invoice List, the Dashboard/Invoice Tab dichotomy, and the psychology of Empty States. The transformation moves the user from a passive state of data entry to an active state of financial command, utilizing "Pulse UI" animations, "Squircle" geometry, and "Live Activities" to create an interface that feels alive, responsive, and deeply integrated into the professional's daily workflow.
________________
1. The "Invoice List" Re-invention
The invoice list acts as the central nervous system of any billing application. However, the prevailing design pattern—often a direct translation of a database table into a mobile list view—fails to account for the emotional and cognitive context of the user. An invoice is not merely a row of strings and integers; it is a claim to capital, a representation of labor performed, and a promise of future revenue. To strip the application of its "robotic" feel, we must fundamentally alter how these digital objects are presented, moving from a text-heavy table to a collection of distinct, tactile assets.
1.1 Visual Hierarchy and the "Wallet Pass" Paradigm
The primary failure of cluttered interfaces is the lack of a distinct visual hierarchy. When every data point—Client Name, Date, ID, Amount, Status—is presented with equal visual weight, the user’s brain must actively parse the screen to find relevant information. This cognitive load is perceived as "clutter." To resolve this, we look to one of the most successful implementations of complex data density on iOS: the Apple Wallet pass.
Research into Apple Wallet’s design structure reveals a highly specific hierarchy that prioritizes information based on immediate utility rather than database schema order.1 Wallet passes utilize a strict layout composed of a Primary Field, Secondary Fields, and Auxiliary Fields. Applying this to ContractorPro requires a radical shift in cell design.
The Primary Field must anchor the visual experience. In a Wallet pass, this is often the boarding gate or the balance. For an invoice, the most emotionally resonant data point is the Amount Due. This figure represents the user’s livelihood. Following the HIG’s typographic principles, we should utilize San Francisco (SF) Pro Display, specifically in a "Heavy" or "Black" weight, to render the amount.2 By placing this element in the bottom-trailing position of the card (the bottom-right), we align with the natural terminal point of the user’s scanning pattern (the Z-pattern), allowing the eye to rest on the value of the asset.
The Secondary Fields provide the necessary context to justify the primary value. This slot belongs to the Client Name. Unlike the robotic list which might truncate long names, the new card design allocates the top-leading quadrant to the client entity, utilizing a Semibold weight to distinguish it from metadata.4 The research indicates that grouping related items through proximity and negative space—rather than explicit lines or borders—reduces visual noise.5 Therefore, the Client Name should sit in clear, unencumbered space, separated from the amount by whitespace rather than grid lines.
Auxiliary Fields handle the metadata: Invoice ID and Dates. A critical insight from HIG research is the recommendation to keep item text succinct.4 A "robotic" app displays "Due Date: October 24, 2025." A "human" app processes this data and displays "Due in 3 days." This shift from absolute data to relative context removes a calculation step for the user, making the app feel smarter and more helpful. These fields should be rendered in smaller, lighter fonts (SF Pro Text, Regular or Medium), utilizing tertiary label colors (system gray) to recede into the background until specifically sought by the user.6
1.2 The Physics of the Card: Geometry and Spacing
The "robotic" feel often stems from harsh geometries. Standard UI frameworks typically render rectangular boxes with sharp 90-degree corners or basic rounded corners. Apple’s design language, however, relies on the "Squircle"—a superellipse that creates a continuous curve, smoothing the transition between the straight edge and the corner.8
To align ContractorPro with the native iOS aesthetic, we must adopt this geometry. Research suggests that a corner radius of approximately 10px to 13px is standard for list items that function as cards.9 However, the radius interacts with the padding. If the card is full-width (touching the screen edges), a smaller radius or no radius is expected. To break the "spreadsheet" look, the Invoice List should utilize an "Inset Grouped" style, where invoices are distinct cards floating on a system background. This introduces margins on the leading and trailing edges, allowing the background color to frame the content.5
This use of negative space is critical. The HIG emphasizes that essential information must be given sufficient space to breathe.5 By increasing the padding within the card (internal margins) and the spacing between cards (inter-item spacing), we reduce the density of the interface without reducing the information content. This "air" allows the user to perceive each invoice as a separate, manageable object, reducing the anxiety associated with a long list of debts.
1.3 Status Indicators: Semiotics over Text
A major contributor to clutter is the reliance on text for status indication. Words like "Pending," "Overdue," "Draft," and "Paid" add character count and cognitive load. The brain processes color and shape pre-attentively, meaning effectively designed indicators are understood before the user consciously reads them.
We must replace text labels with a system of abstract but intuitive glyphs and colors. However, standard system colors (pure Red #FF0000 or Green #00FF00) often feel harsh and antiquated—reminiscent of early computing, hence the "robotic" descriptor. The research points to a trend of using vibrant, "electric" hues that maintain accessibility while feeling modern.
For a "Paid" status, a Neon Green or Bright Green (e.g., #39FF14 or #66FF00) offers a high-energy signal of success.10 To ensure this meets WCAG AA accessibility standards (a contrast ratio of at least 4.5:1), this color should be used as a background element (like a badge or pill shape) with dark text, or as a glyph against a dark surface.12 Conversely, "Overdue" status should leverage an Electric Orange (e.g., #FF3503), which conveys urgency and alertness without the punitive, error-associated connotation of deep crimson.13
The shape of the indicator matters. A "Capsule" or "Lozenge" shape (rounded rectangle) is the standard iOS pattern for status badges.14 This shape mimics the physical tags used in retail or filing, reinforcing the object-oriented mental model. By placing this badge in the top-trailing position of the card, it acts as a secondary anchor, allowing the user to scan down the right side of the list to quickly assess the health of their accounts receivable.
1.4 Gestures: The Tactile Workflow
The "robotic" interface is static; interaction is limited to "Tap to Open." A "human" interface utilizes the full range of physical inputs available on the device, specifically swipe gestures, to allow management without navigation.
The Apple HIG advises offering alternatives to gestures for accessibility, but prioritizes fluid gestures for power users.15 In the context of an invoice list, the "Swipe to Delete" standard is insufficient and potentially dangerous. We must map gestures to the user’s most frequent needs.
Swipe Right (Leading Swipe): This gesture is ergonomically primary for right-handed users. In many mail applications, this is "Archive" or "Mark Read." For ContractorPro, the emotional equivalent is "Mark as Paid." This action creates a positive loop. When a user swipes right, the reveal should be a vibrant green, and the completion of the gesture should trigger a satisfying haptic feedback (using UIImpactFeedbackGenerator(style:.heavy)). This physical "thud" confirms the transaction, turning a digital update into a tangible accomplishment.16
Swipe Left (Trailing Swipe): This reveals management options.
1. More (...): A gray action that opens a context menu or action sheet (Duplicate, Share, Print).
2. Remind: An orange action that triggers an immediate email or push notification to the client. This "nudge" feature is high-value for contractors and fits perfectly in a quick-access gesture.
3. Delete/Void: A red destructive action, placed furthest from the edge to prevent accidental activation.
These gestures must follow the "rubber band" physics of iOS, where the list resists the pull at the extremities, maintaining the illusion of a continuous physical surface.5
________________
2. The "Dashboard" vs. "Invoice Tab" Conflict
A persistent friction point in financial app design is the redundancy between the "Dashboard" and the "Invoice List." In many "robotic" apps, the Dashboard is simply a truncated version of the list, leading to user confusion: "Where do I go to see my invoices?" To resolve this, we must clearly delineate their purposes: The Invoice Tab is for Management (The Database); The Dashboard is for Insight (The Pulse).
2.1 Navigation Architecture: The "Thumb Zone" Standard
The navigation structure defines the mental map of the application. Research into mobile navigation trends for 2025 emphasizes the dominance of the Bottom Tab Bar over hamburger menus or side drawers.17 As device screens expand (e.g., iPhone 17 Pro Max), the top corners of the screen become "dead zones," unreachable for one-handed users.
ContractorPro must adopt a standard 3-to-5 item Tab Bar to anchor the user.
* Tab 1: Dashboard (The Pulse). Icon: chart.bar.fill.
* Tab 2: Invoices (The List). Icon: list.bullet.rectangle.portrait.fill.
* Tab 3: Clients (The CRM). Icon: person.2.fill.
* Tab 4: Settings (The Config). Icon: gear.
This structure places the two most critical views—Dashboard and Invoices—adjacent to each other, allowing for rapid switching. It eliminates the "hidden" navigation of drawers, ensuring that the user’s location within the app is always visible and explicit.19
2.2 The Pulse UI: Making Data "Alive"
The Dashboard often feels robotic because it is static. It displays a snapshot of data that feels old the moment it is rendered. To create a "Pulse UI," we must leverage animation to convey currency and activity.
Rolling Number Transitions:
A critical innovation in iOS 17 is the contentTransition(.numericText()) modifier in SwiftUI.20 This allows numeric values to animate when they change, "rolling" into place like a mechanical flip-clock or a gas pump counter.
* Implementation: When the Dashboard loads, the "Total Revenue" figure should not simply appear. It should count up (e.g., from $0 to $12,500) over a short duration (e.g., 0.8 seconds).
* Psychology: This animation does two things. First, it draws the eye, establishing the hierarchy of the page. Second, it simulates calculation. It tells the user, "I am checking your books, counting your money, and here is the result." It makes the app feel like an active agent working for the user rather than a passive screen.21
Visualizing Time:
The Invoice Tab is a vertical list, optimal for scanning rows. To differentiate the Dashboard, we should utilize Horizontal Scroll Views (Card Grids).23 A horizontal carousel of "Recent Activity" or "Monthly Income" charts breaks the vertical monotony. This change in scroll axis signals a change in context: Vertical is for deep diving (Invoices), Horizontal is for browsing (Dashboard).
2.3 Live Activities: The Dashboard Beyond the App
The most profound shift in iOS 17/18 UX is the concept of Live Activities. This feature allows an app to project real-time data onto the Lock Screen and the Dynamic Island.24 For a contractor, the "robotic" workflow involves constantly unlocking the phone, opening the app, and refreshing to see if a payment has arrived.
Live Activities transform this "Pull" model into a "Push" model.
* Scenario: A contractor sends a high-value invoice. They toggle a "Track Payment" switch.
* The Artifact: A Live Activity appears on the Lock Screen.
   * Leading: The Client Name and Invoice ID.
   * Trailing: A pulsing status indicator ("Pending").
   * Dynamic Island: When the contractor is using other apps (e.g., Maps, Phone), the Dynamic Island shows a compact status bubble.
* The Resolution: When the payment webhook is received, the Live Activity expands to show a green checkmark and the text "PAID," then dismisses itself.
* Impact: This keeps the contractor connected to their financial status without the friction of app navigation. It turns the Dashboard into a ubiquitous companion.25
________________
3. The "Empty State" Psychology
The "robotic" feel is perhaps most damaging when the app is devoid of data. A screen that reads "No Invoices Found" or simply displays a blank white space is a UX dead end. It implies a lack of utility. In HIG philosophy, empty states are "teachable moments"—opportunities to onboard, educate, and drive action.26
3.1 The Psychology of the Blank Slate
When a user first installs ContractorPro, the Invoice List is empty. This is the "Blank Slate." A robotic app treats this as a null state (Error: 0 items). A human app treats this as potential space. The anxiety of the blank page—"How do I start? What goes here?"—must be mitigated by design.
The Strategy: Guidance and Empathy
We must move the user from Confusion to Action.
* Illustration: Modern trends for 2025 favor high-quality, possibly 3D or abstract illustrations over generic icons.28 An illustration of a clean, organized workspace, or a metaphor for growth (a planting sprout), sets a positive tone. It visually fills the void, signaling that the space is intentionally empty, not broken.29
* Copywriting: The voice of the app must change.
   * Robotic: "No Invoices."
   * Human: "Let's Get You Paid."
* Subtext: "Create your first invoice in seconds. We'll track the payment for you." This explains the value of the action, not just the function.27
3.2 Types of Empty States
We must distinguish between different types of emptiness, as the user’s emotional state varies in each.
1. First Run (Onboarding): The user is new. The goal is education.
   * Action: A large, prominent button: "Create First Invoice."
2. User-Cleared (Success): The user has filtered by "Overdue," and the list is empty.
   * Context: This is a victory. The user has no debts to chase.
   * Visual: A celebration. A coffee cup, a "feet up" illustration, or even a subtle confetti animation.
   * Copy: "All caught up!" or "No overdue invoices. Great job.".31
3. No Results (Search/Filter): The user searched for "Acme," and nothing was found.
   * Action: "Clear Search" or "Create Invoice for Acme." The app should anticipate the next step—if I searched for it and it’s not there, maybe I want to create it.29
3.3 The "Skeleton" Loading State
A subtle but critical aspect of avoiding the "robotic" feel is the transition to the data. When the app launches, fetching data takes milliseconds or seconds. A "robotic" app shows a spinning wheel (a blocker). A "human" app shows a Skeleton Screen—a shimmering, gray-scale outline of the card layout.33
* Psychology: This tells the user, " The structure is here, the content is pouring in." It reduces the perceived wait time and makes the eventual appearance of data (or the empty state) feel less jarring. It maintains the visual rhythm of the list even before the list exists.
________________
4. Design System Specifications & Accessibility
To ensure the "ContractorPro" redesign is consistent, scalable, and fully native to the Apple ecosystem, a rigorous Design System must be established. This system acts as the source of truth for all UI decisions, ensuring that the "human" feel is mathematically and aesthetically consistent.
4.1 Typography System: San Francisco (SF) Pro
Apple’s system font, San Francisco, is designed for optimal legibility. However, the standard SF Pro can feel slightly cold or corporate. For ContractorPro, which targets independent workers who likely value a more approachable tool, we will utilize SF Pro Rounded.
Rationale: The rounded terminals of SF Pro Rounded soften the interface, subtly reinforcing the "friendly" and "human" character without sacrificing the legibility and weight hierarchy of the system font.2
UI Element
	Font Style
	Weight
	Size
	Color Token
	Invoice Amount
	SF Pro Rounded (Monospaced)
	Heavy / Black
	22pt
	label (Primary)
	Dashboard Total
	SF Pro Rounded (Monospaced)
	Heavy
	34pt
	label (Primary)
	Client Name
	SF Pro Rounded
	Semibold
	17pt
	label (Primary)
	Invoice ID
	SF Pro Text
	Medium
	13pt
	secondaryLabel
	Relative Date
	SF Pro Text
	Regular
	13pt
	tertiaryLabel
	Status Badge
	SF Pro Text
	Bold (Caps)
	11pt
	White / Contrast
	Note regarding Monospaced Digits: It is imperative to apply the .monospacedDigit() modifier to all prices and dates. This ensures that the numerals align vertically in lists and prevents character jitter during the "Rolling Number" animations.34
4.2 Color System: High Contrast & Dark Mode
The "robotic" feel often comes from using the default palette provided by UI frameworks without adaptation. To achieve the "Fintech Pro" aesthetic, we define a semantic color palette that adapts to Light and Dark modes.
The "Electric" Status Palette:
As identified in the research, we are moving away from standard traffic-light colors to high-energy hues that signal modernity.
Semantic Role
	Light Mode Hex
	Dark Mode Hex
	Usage Context
	Success / Paid
	#248A3D (Forest)
	#39FF14 (Neon Green)
	Status badges, "Paid" animations
	Warning / Overdue
	#D93600 (Burnt Orange)
	#FF3503 (Electric Orange)
	Overdue badges, urgent alerts
	Neutral / Draft
	#8E8E93 (System Gray)
	#98989D (System Gray 2)
	Drafts, secondary icons
	Brand Accent
	#007AFF (System Blue)
	#0A84FF (System Blue)
	Active tab, Primary Buttons
	Background
	#F2F2F7 (System Gray 6)
	#000000 (Pure Black)
	Main view background
	Card Surface
	#FFFFFF (White)
	#1C1C1E (Dark Gray)
	Invoice cards, Dash widgets
	Accessibility Compliance (WCAG AA):
The Neon Green (#39FF14) used in Dark Mode is extremely bright. It works exceptionally well as a background glow or an icon color against a black surface. However, white text on Neon Green fails contrast ratios.
* Correction: When using Neon Green as a badge background, the text inside MUST be black (#000000) or a very dark green. This ensures a contrast ratio > 4.5:1.12
* Light Mode: The Neon Green is too bright against a white background (low contrast). Therefore, in Light Mode, the system must swap to a darker, richer "Forest Green" (#248A3D) or use a tinted background (Light Green surface with Dark Green text).
4.3 Component Library: The "Squircle" Spec
To ensure the "card" aesthetic is consistent, we define the geometry tokens.
* Corner Radius: 12pt.
* Corner Smoothing: "Continuous" (61%).
* Shadows:
   * Light Mode: Y: 2, Blur: 8, Spread: 0, Color: Black (Opacity 8%).
   * Dark Mode: Shadows are often invisible. Instead, we rely on surface lightness. The card background (#1C1C1E) is lighter than the app background (#000000), creating elevation through contrast rather than shadow.36
________________
5. Implementation Strategy & Case Comparative
5.1 Comparative Analysis: Generic vs. ContractorPro
To validate this approach, we compare the proposed "ContractorPro" design against a generic "Robotic" competitor.
Feature
	Generic "Robotic" App
	Redesigned "ContractorPro"
	Impact
	List View
	Dense table rows, 100% width, text-heavy.
	Floating cards, visual grouping, strong typography.
	Reduced cognitive load; enhanced scannability.
	Status
	Text: "Paid", "Overdue".
	Icons: Green Check, Orange Alert. Color-coded badges.
	Pre-attentive processing; faster recognition.
	Navigation
	Hamburger menu + Back buttons.
	Bottom Tab Bar + Horizontal Dash scroll.
	improved "Thumb Zone" access; clearer hierarchy.
	Dashboard
	Static list of recent items.
	Rolling number animations, Live Activities.
	Feeling of "liveness" and system intelligence.
	Empty State
	"No Data Found."
	Illustration + "Let's Get You Paid" + CTA.
	Higher conversion from zero to one.
	5.2 Technical Implementation Roadmap (SwiftUI)
The transition to this new design system requires specific engineering tactics.
Phase 1: The Grid (Layout Refactor)
* Transition from List (which enforces system styling) to ScrollView + LazyVStack. This gives full control over card spacing, padding, and shadows.
* Implement Grid or compositional layouts for the Dashboard to allow for side-scrolling widget rows.23
Phase 2: The Pulse (Animation)
* Identify all Text views displaying financial aggregates.
* Apply .contentTransition(.numericText(value: totalRevenue)).38
* Ensure the backing data source (@State or ObservableObject) updates the value triggers the animation.
Phase 3: The Touch (Interaction)
* Replace standard buttons with ButtonStyles that implement scaleEffect on press. When a user taps a card, it should shrink slightly (to 0.98 scale), mimicking the compression of a physical button.
* Integrate UIImpactFeedbackGenerator into the View Models.
   * Success: impactOccurred(intensity: 1.0) (Mark Paid).
   * Selection: selectionChanged() (Tab switch).
Phase 4: The Reach (Live Activities)
* Develop a Widget Extension for the app.
* Define the ActivityAttributes for an invoice (Client Name, Amount, Due Date).
* Design the Dynamic Island Compact and Expanded views to ensure the status is readable at a glance.25
5.3 Conclusion
The redesign of "ContractorPro" is not merely cosmetic. It is an architectural shift rooted in the psychology of the user. By acknowledging that independent contractors view their invoices as tangible assets, we justify the move to a card-based, "Wallet-style" interface. By understanding the anxiety of financial management, we justify the "friendly" typography and encouraging empty states. By recognizing the need for speed and responsiveness, we justify the use of gestures and Live Activities.
This report provides the blueprint to move "ContractorPro" from a "cluttered, robotic" utility to a "human-centric" financial partner, leveraging the full power of the Apple Human Interface Guidelines to deliver a best-in-class iOS experience. The result is an application that doesn't just record value, but creates a feeling of value in every interaction.
Works cited
1. Blog: Designing Apple Wallet Passes: Text Alignment, Layout, and Behavior - PassNinja, accessed January 11, 2026, https://www.passninja.com/blogs/design-tips/designing-apple-wallet-passes-text-alignment-layout-and-behavior
2. San Francisco (sans-serif typeface) - Wikipedia, accessed January 11, 2026, https://en.wikipedia.org/wiki/San_Francisco_(sans-serif_typeface)
3. yell0wsuit/Apple-Fonts-Documentation - GitHub, accessed January 11, 2026, https://github.com/yell0wsuit/Apple-Fonts-Documentation
4. Lists and tables | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
5. Layout | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/layout
6. Color | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/color
7. What is the color code for iOS system labels in both light and dark mode? - Stack Overflow, accessed January 11, 2026, https://stackoverflow.com/questions/64888882/what-is-the-color-code-for-ios-system-labels-in-both-light-and-dark-mode
8. The iOS 17 Design Guidelines: An Illustrated Guide, accessed January 11, 2026, https://www.learnui.design/blog/ios-design-guidelines-templates.html
9. iOS Design | Understanding Corner radius for iOS components. : r/UI_Design - Reddit, accessed January 11, 2026, https://www.reddit.com/r/UI_Design/comments/14lwmwf/ios_design_understanding_corner_radius_for_ios/
10. What Color is Neon Green? HEX Code, Meaning & UI Designs - Mobbin, accessed January 11, 2026, https://mobbin.com/colors/meaning/neon-green
11. Neon Green - HTML Color Codes, accessed January 11, 2026, https://htmlcolorcodes.com/colors/neon-green/
12. Color | Digital Accessibility, accessed January 11, 2026, https://dap.berkeley.edu/web-a11y-basics/color
13. Electric Orange Color Palette, accessed January 11, 2026, https://www.color-hex.com/color-palette/1032994
14. Human Interface Guidelines | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines
15. Accessibility | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/accessibility
16. Handling swipe gestures | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/documentation/uikit/handling-swipe-gestures
17. Mobile Navigation Report: UX Best Practices for Financial Services Firms - Corporate Insight, accessed January 11, 2026, https://corporateinsight.com/mobile-navigation-report-ux-best-practices-for-financial-services-firms/
18. Bottom navigation bar in mobile apps: The complete 2025 guide for UI/UX designers, accessed January 11, 2026, https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/
19. Mobile Navigation Best Practices, Patterns & Examples (2026) - Design Studio UI/UX, accessed January 11, 2026, https://www.designstudiouiux.com/blog/mobile-navigation-ux/
20. Animating views and transitions — SwiftUI Tutorials | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/tutorials/swiftui/animating-views-and-transitions
21. Number Text Animation in SwiftUI with contentTransition - Holy Swift, accessed January 11, 2026, https://holyswift.app/how-to-animate-text-in-swiftui-using-contenttransition/
22. Animating number changes in SwiftUI - Sarunw, accessed January 11, 2026, https://sarunw.com/posts/animating-number-changes-in-swiftui/
23. Table vs List vs Cards: When to Use Each Data Display Pattern (2025), accessed January 11, 2026, https://uxpatterns.dev/pattern-guide/table-vs-list-vs-cards
24. Displaying live data with Live Activities | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities
25. Live Activities | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/live-activities/
26. Writing | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/writing
27. Empty State UI design: From zero to app engagement - Setproduct, accessed January 11, 2026, https://www.setproduct.com/blog/empty-state-ui-design
28. UI/UX Design Trends in Mobile Apps for 2025 | Chop Dawg, accessed January 11, 2026, https://www.chopdawg.com/ui-ux-design-trends-in-mobile-apps-for-2025/
29. Empty States - HIG, accessed January 11, 2026, https://hig.concur.com/pages/design/web/patterns/empty-states.html
30. Empty State UX Examples & Best Practices - Pencil & Paper, accessed January 11, 2026, https://www.pencilandpaper.io/articles/empty-states
31. Things - To-Do List App for Mac & iOS, accessed January 11, 2026, https://www.culturedcode.com/
32. Empty states - Intuit Content Design System, accessed January 11, 2026, https://contentdesign.intuit.com/product-and-ui/empty-states/
33. Loading | Apple Developer Documentation, accessed January 11, 2026, https://developer.apple.com/design/human-interface-guidelines/loading
34. Fonts - Apple Developer, accessed January 11, 2026, https://developer.apple.com/fonts/
35. Making Color Usage Accessible | Section508.gov, accessed January 11, 2026, https://www.section508.gov/create/making-color-usage-accessible/
36. Dark theme - Material Design, accessed January 11, 2026, https://m2.material.io/design/color/dark-theme.html
37. Edit and organize a list in Reminders on iPhone - Apple Support, accessed January 11, 2026, https://support.apple.com/guide/iphone/edit-and-organize-a-list-iph82596cb20/ios
38. Animating numeric text in SwiftUI with the Content Transition modifier - Create with Swift, accessed January 11, 2026, https://www.createwithswift.com/animating-numeric-text-in-swiftui-with-the-content-transition-modifier/