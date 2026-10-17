// The full case studies, as written in the PDFs (Crop Care, InForm for OnTrack, Lign).
// tools/build-case-studies.js turns each into a light and a dark page.
// Markup, one block per paragraph (blank line between):
//   ## Heading {#id}   a section (the id is its link in the sidebar)
//   ### Heading        a subheading
//   - item / 1. item   list items (consecutive lines make one list)
//   @meta a | b | c    a row of short facts
//   ![alt text](case-studies/file.png)   an image (a PNG), on its own line
//   **bold**, _italic_, [text](url)
module.exports = {
    cropcare: {
        name: 'Crop Care',
        title: 'Crop Care case study',
        pdf: 'case-studies/crop-care-case-study.pdf',
        pdfName: 'Crop Care case study.pdf',
        cover: 'case-studies/crop-care-cover.png',
        coverAlt: 'Crop Care cover: a swirl of green leaves with one orange leaf breaking away',
        body: `
## 1. Introduction {#introduction}

Crop Care is a plant-disease app that helps growers name what's wrong, act on it, and remember what happened.

@meta **Role:** Product designer | **Timeline:** 2 months | **Tools:** Figma

A leaf turns brown. A plant wilts for no clear reason. For a farmer, that could mean a lost season. For someone growing tomatoes at home, it's a small heartbreak. Either way, the question is the same: what is this, and what do I do?

Crop Care answers that from a single photo. Point the camera at a sick leaf, and the app names the likely disease, explains it in plain language, and suggests what to do next. Every scan is saved, so over time the app becomes a record of what went wrong and what worked.

The idea wasn't mine. It began as a school project led by students in another department, and I joined as the designer. They brought the concept. I took it from early conversations with farmers in Accra through to a working prototype.

This case study covers why the problem matters, how the app works, the decisions behind it, and the hardest question it raises: how should an app behave when it might be wrong?

## 2. The problem {#the-problem}

When a crop gets sick, most growers in Ghana have no quick way to find out what it is, and no record of what worked last time.

### Context

From village farms to open plots in the middle of Accra, most of Ghana's farming is done by smallholders. They make up about 80% of the sector. Globally, pests and diseases take somewhere between a fifth and a third of major staple crops.

Help is thin. Estimates put Ghana at one extension officer for every 700 to 1,500 farmers. Rural literacy sits around 55%, against 81% in towns and cities. And in one survey of 1,565 farmers in Northern Ghana, only about 1 in 6 owned a smartphone.

So Crop Care had to work for the farmer and for the son, niece or field agent who scans the leaf on their behalf.

### What I heard

I spoke informally with four or five farmers growing maize, cabbage and lettuce on open plots near Korle Bu, in central Accra. These were casual chats, not structured interviews. I came away with impressions, not findings, and five people can't speak for every grower in Ghana.

Still, a pattern stood out. None of them kept a record of crop problems. What they knew lived in memory, learned from fathers and uncles. Research on African farming describes the same thing: pest knowledge is built from experience and passed down by word of mouth.

Even in the capital, with a hospital next door and phones in every pocket, crop knowledge still travelled the old way. That knowledge is valuable. But memory fades, and it doesn't travel.

### Two problems, not one

- **Right now:** what is wrong with my plant, and what do I do?
- **Over time:** has this happened before, and what worked last time?

Most plant apps answer the first question. Crop Care is designed for both.

### Who it's for

A farmer near Korle Bu notices brown spots spreading across her cabbage. Across town, someone growing tomatoes in a backyard bed sees the leaves curling. One has income at stake. The other has care and pride. Neither has the words for what they're looking at.

They sit at two ends of one spectrum, and they share one need: help me understand what's wrong, and help me remember it. Research on low-literacy design found text-heavy interfaces were unusable for first-time low-literacy users, and error-prone even for literate newcomers. Designing for the farmer makes the app easier for everyone.

There's often a quiet third person too: the helper who holds the phone. The flow stays the same for all of them. Scan, understand, act, remember.

### The business side

The team behind the idea wanted a tool farmers would actually trust and keep using. As a school project, there was no budget, no engineers and no live AI model. The job was to prove the idea worked as an experience before anyone built it.

The tension I watched for was money versus trust. A free diagnosis app can make money by pushing products, and the easiest product to push is a chemical. If every result ends in "buy this spray", farmers learn the app is selling, not helping. So treatment advice in Crop Care leads with what the grower can do, and stays honest about uncertainty, even when a confident answer would look more impressive.

The more sustainable path is partnership. Ghana's Ministry of Food and Agriculture already backs digital extension in its e-extension strategy for 2022 to 2030. A tool that helps thin extension services reach more farmers fits that direction better than a tool built around sales.

## 3. The app {#the-app}

Crop Care does four things: scan, understand, act, remember. Each has its own moment in the app.

### Getting started

The app opens with two numbered steps: photograph a sick leaf, get a suggestion. That's the whole tutorial. From home, one tap opens the camera or the gallery, with recent scans waiting underneath.

![Four Crop Care screens: the welcome screen with Take Photo and Choose From Gallery, an empty home screen, the camera and gallery menu, and the gallery of leaf photos](case-studies/crop-care-getting-started.png)

### Scan

The camera fills the screen. While the app works, the leaf shimmers and a rabbit, a turtle and a leaf take turns as the loading icon. A quiet joke about speed and patience, and a nicer thing to watch than a spinner.

![Two Crop Care screens: the camera pointed at a maize leaf, and the same photo shimmering while the app works](case-studies/crop-care-scan.png)

### Understand and act

The result leads with the disease name in large serif type, set against the photo. Below sit four plain sections: Symptoms, Cause, Prevention and Treatment. As you scroll, the photo shrinks to a thumbnail, so the answer takes over without losing sight of the leaf.

![Two Crop Care result screens for Leaf Rust: the photo with a "Very likely" coin above Symptoms and Cause, and the scrolled view with the photo shrunk to a thumbnail](case-studies/crop-care-result.png)

In the corner of the photo, a small coin flips on its own to reveal how sure the app is: "96%, Very likely". On an otherwise still screen, the movement draws the eye to confidence before you act. Then it rests on the score.

Beside the disease name sits the voice button. Tap it and the app reads the result aloud, and you can ask it questions back. For a farmer who finds the text hard going, or a helper reading on someone's behalf, the result becomes a conversation rather than a page.

### When the app isn't sure

If confidence is low, the coin turns amber and reads "Not sure". A card at the top says so plainly and asks for photos of two or three more leaves. The app would rather ask for more than guess.

![Two Crop Care result screens where the coin reads "Not sure", with a card asking for photos of 2 or 3 more leaves and a Scan more leaves button](case-studies/crop-care-not-sure.png)

### Remember

Every scan saves to History: crop, disease, confidence, date and a one-line recommendation. Each entry is small. Together they become the crop-health record none of the farmers I spoke to kept. Next season, "has this happened before?" finally has an answer.

![The Crop Care history screen: a list of recent scans, each with the disease, crop, confidence and date](case-studies/crop-care-history.png)

## 4. Design process {#design-process}

Every major decision traces back to something I heard from farmers or read in published research.

### Listening, then reading

The farmer conversations shaped the brief. Nobody kept a record of crop problems, so remembering became half the app. I then turned to published research on smallholder farming, low-literacy design and how people trust AI. It told me who the app had to work for, and where it could go wrong.

### An assumption I had to drop

I expected to design for rural farmers. The people I actually met were urban growers in central Accra. That pushed me towards one app for a spectrum of growers, rather than a tool only for remote villages.

### What I considered, and what I chose

**Words only for confidence, or words plus a number.** "Likely" feels friendlier for low-literacy users. But research shows people read words like "likely" very differently, and that pairing a number with a word works better. I chose both: "96%, Very likely".

**One confident answer, or an honest "not sure".** A single confident diagnosis looks more impressive. But plant AI is far less accurate in real fields than in the lab. I designed a low-confidence state that asks for more leaves instead of guessing.

**A coin that flips forever, or one that settles.** My first version flipped non-stop to keep catching the eye. But constant motion stops being noticed, hides the score half the time, and breaks accessibility guidance on moving content. Now it flips when the result appears, then rests on the score.

**A logbook you fill in, or one that fills itself.** Research on farm records shows people skip them when they feel like extra work. So every scan saves to History automatically. The record is a by-product, not a chore.

**Text, or voice too.** Text alone leaves out the people who need the app most. The voice button reads the result aloud and takes questions back.

### The trade-off I kept

Hiding the score on the back of the coin keeps the result screen calm, with the disease name and photo leading. The cost is that a still coin is easy to miss. The flip is how I pay that cost: motion pulls the eye to confidence at the moment someone decides what to do.

## 5. Challenges {#challenges}

The hardest part of Crop Care isn't recognising a disease. It's what the app should do when it might be wrong.

### The constraints I worked within

- **Two months, one designer, Figma only.** No engineers, so every idea had to be shown as an experience, not built.
- **No real AI model.** I couldn't test accuracy. I had to design for an AI whose mistakes I could only predict from research.
- **Shared phones.** Many farmers don't own a smartphone, so the person scanning may not be the person whose crop it is.
- **Mixed literacy.** Every important message had to work without careful reading.
- **The idea belonged to someone else.** My job was to make their concept work for growers, not replace it with mine.

### Why the AI will be wrong

In one well-known study, a plant disease model scored 99% on clean lab photos. On photos taken in other conditions, it dropped to 31%. Real leaves are dusty, shadowed and photographed in a hurry. Crop Care's AI would face exactly those photos.

There's a second risk. When people see an AI make a mistake, they lose faith in it faster than they would in a person. One confident wrong answer could lose a farmer for good. And research shows that showing a confidence score helps people judge when to trust the AI, but doesn't automatically make their decisions better. So simply adding a number wasn't enough.

### How the design responds

1. **Confidence at the decision moment.** The coin flips as soon as the result appears, so how sure the app is arrives before anyone acts, not later in History.
2. **Word, number and colour together.** "96%, Very likely" in green, or "Not sure" in amber. Each format covers a weakness of the others.
3. **Ask for more instead of guessing.** In a field study of one plant app, accuracy rose from 65% to as high as 88% when six leaves per plant were assessed. So when confidence is low, Crop Care asks for two or three more leaves.
4. **Memory as a check.** Over time, History shows whether past suggestions and treatments actually worked. The record helps people judge the app, not just remember their crops.

### What I haven't solved

I found no published study of how farmers read AI confidence scores. My design rests on research from other fields, so it needs testing with real growers. If a result stays unclear after more photos, the app should also point people to a human: an extension officer or a plant clinic. That route isn't designed yet.

## 6. What's next {#whats-next}

Crop Care is a prototype. It hasn't shipped and hasn't been tested with farmers, so there are no results to report yet. I'd rather say that than invent numbers.

### What changed

The design itself moved a long way. It started as a scanner that announced a disease as fact. It ended as an app that shows how sure it is at the moment of decision, says "not sure" when it should, can talk instead of only showing text, and remembers every scan without being asked.

### How I would test it (not yet done)

The first test would be a small usability study with about five growers in Accra, mixing plot farmers and home growers. Unlike my early chats, these would be planned sessions with set tasks. I'd watch for:

- **Noticing confidence.** Do people see the coin before acting, and can they say what it meant?
- **Acting on "not sure".** When confidence is low, do people take more photos, or ignore the prompt?
- **Using voice.** Do people who struggle with the text tap the voice button without being shown?
- **Returning to History.** Weeks later, do people look back at past scans when a problem returns?

### The next version

- **Crop profiles.** One page per crop showing its scan history over time, so patterns become visible.
- **Local languages.** The voice conversation in Twi, Ga and other Ghanaian languages, not just English.
- **A route to a human.** When the app stays unsure, a clear path to an extension officer or plant clinic.
- **Testing with real growers.** Everything above depends on it.

### Get involved

We're now working to build Crop Care for real. If you'd like to support it, whether through funding, a partnership, or helping us test with growers, we'd love to hear from you.

## References {#references}

1. Abate, T., van Huis, A. & Ampofo, J.K.O. (2000). [Pest management strategies in traditional agriculture: an African perspective](https://www.annualreviews.org/content/journals/10.1146/annurev.ento.45.1.631). _Annual Review of Entomology_, 45.
2. Abdulai, A.-R. et al. (2023). [Is agricultural digitization a reality among smallholder farmers in Africa?](https://link.springer.com/article/10.1186/s40066-023-00416-6) _Agriculture & Food Security_.
3. Dhami, M.K. & Mandel, D.R. (2022). [Communicating uncertainty using words and numbers](https://www.sciencedirect.com/science/article/pii/S1364661322000602). _Trends in Cognitive Sciences_.
4. Dietvorst, B.J., Simmons, J.P. & Massey, C. (2015). [Algorithm aversion](https://doi.org/10.1037/xge0000033). _Journal of Experimental Psychology: General_, 144(1).
5. Ghana Statistical Service (2021). [2021 Population and Housing Census, Literacy and Education](https://census2021.statsghana.gov.gh/gssmain/fileUpload/reportthemesub/2021%20PHC%20General%20Report%20Vol%203D_Literacy%20and%20Education.pdf).
6. Medhi, I. et al. (2011). [Designing mobile interfaces for novice and low-literacy users](https://doi.org/10.1145/1959022.1959024). _ACM Transactions on Computer-Human Interaction_, 18(1).
7. Mohanty, S.P., Hughes, D.P. & Salathé, M. (2016). [Using deep learning for image-based plant disease detection](https://arxiv.org/abs/1604.03169). _Frontiers in Plant Science_, 7.
8. Mrisho, L.M. et al. (2020). [Accuracy of a smartphone-based object detection model, PlantVillage Nuru](https://doi.org/10.3389/fpls.2020.590889). _Frontiers in Plant Science_, 11.
9. Zhang, Y., Liao, Q.V. & Bellamy, R.K.E. (2020). [Effect of confidence and explanation on accuracy and trust calibration in AI-assisted decision making](https://doi.org/10.1145/3351095.3372852). _Proceedings of FAT* 2020_.

Context figures on smallholder share, crop losses and extension officers come from the [Ghana Investment Promotion Centre (2022)](https://www.gipc.gov.gh/wp-content/uploads/2023/03/Ghanas-Agriculture-Sector-Report-1.pdf), [Savary et al. (2019)](https://doi.org/10.1038/s41559-018-0793-y) and the [MoFA e-extension strategy (2022)](https://farmradio.org/wp-content/uploads/2022/05/Agriculture-e-extensions-strategy-digital.pdf).
`,
    },

    ontrack: {
        name: 'InForm',
        title: 'InForm: a diabetes logging app',
        subtitle: 'An interaction design redesign of an untested prototype',
        pdf: 'case-studies/inform-case-study.pdf',
        pdfName: 'InForm case study.pdf',
        cover: 'case-studies/inform-cover.png',
        coverAlt: 'InForm cover: a three by three grid of blue squares with one red square',
        body: `
## 1. Introduction {#introduction}

InForm is a mobile app that helps people with diabetes log their blood sugar, insulin and meals, and get food suggestions back.

The idea came from my grandmother, who lives with diabetes. A friend and I talked it through, and he took it on as his final year project. I designed the screens so he would have something concrete to build from.

That was around a year ago. Since then I have redesigned the app on my own in Figma. The onboarding is shorter, the screens are cleaner, and the logging flow is clearer.

I have not tested InForm with users. What I know so far comes from watching my grandmother, which I treat as context, not evidence.

The question running through this project: how do you make daily health logging simple enough that someone keeps doing it?

## 2. The problem {#the-problem}

Seeing how daily choices move blood sugar starts with logging both. InForm tries to make that logging quick.

The scale is large. An estimated 589 million adults aged 20 to 79 live with diabetes, and about 252 million of them are undiagnosed (IDF, 2025). In Ghana, a 2023 national survey of 5,438 adults found that 5.2% had raised fasting blood glucose, and 70.3% had never had their blood sugar checked (WHO Ghana et al., 2023).

Logging is worth the effort. A 2024 meta-analysis of 54 trials of diabetes apps found a larger average drop in HbA1c in studies that included self-monitoring of behaviour (0.46 points) than in those that did not (0.15) (Tarricone et al., 2024). That is an association across studies, not proof that logging causes the gain.

The catch is that people struggle to keep logging. A 2022 review of 28 studies named frequent data entry, lack of time and difficulty with technology as barriers (Alaslawi et al., 2022). It looked at who starts using apps, not who keeps using them.

Diabetes also takes an emotional toll. A 2017 review of 55 studies found that 36% of people with type 2 diabetes reported diabetes-specific emotional distress (Perrin et al., 2017). The apps are not always easy to read either: a 2015 review of 110 diabetes apps, searched in 2014, found that free apps were less likely than paid ones to use everyday words or avoid undefined medical terms (Caburnay et al., 2015).

Picture someone who eats rice and stew at midday, checks their sugar two hours later and sees a high number. Nothing connects the two. This is an illustrative sketch, not a participant.

My starting point was informal. My grandmother finds it hard to link her meals to her blood sugar, and watching that shaped my questions. A conversation with one person is context, not a research finding.

For now, InForm is for any adult living with diabetes. Version 2 will narrow to a more specific group. The app also assumes a smartphone, and in the 2021 census 4.9 million Ghanaians aged 15 and over did not own a smartphone (Ghana Statistical Service, 2023).

There is no client or business model behind InForm. The nearest thing to a business constraint was scope, because the project began as a friend's final year project.

## 3. The app {#the-app}

InForm asks for little up front, then puts every logging action behind one button. These are the moments in the order someone meets them.

**Setup takes two screens.** After a short intro, the app asks for diabetes type, age at diagnosis and insulin use, then says welcome. That is three questions on two screens. The earlier version asked four questions across four screens, including body weight.

**Home shows today at a glance.** A week strip, a streak prompt, the latest reading, shortcuts to records and the meal plan, meal suggestions and a water counter sit on one screen. Nothing needs to be opened to see how the day is going.

**One button starts every log.** The plus button sits beside the navigation bar, so it is on every main screen. It opens four options: Log Water, Log Meal, Log Insulin and Log Blood Sugar. I put it there to make logging quick, wherever you are in the app.

![Four InForm screens: the splash screen, the intro with Create Account, the home screen showing 98 mg/dL, and the plus menu with Log Water, Log Meal, Log Insulin and Log Blood Sugar](case-studies/inform-setup-home.png)

_Left to right: splash, intro, home, and the plus menu with its four options. Screens from the Figma prototype._

**Logging blood sugar is a short form.** You enter the reading, say when it was taken, such as Before Breakfast, set the date and save. A range guide sits underneath: below 80 is Low (blue), 80 to 130 is Good (green), above 130 is High (red).

**Logging a meal is a list and a plus.** Each meal has a photo, a short nutrition note and a plus to log it. No typing is needed on this screen.

**Looking back is a chart and a list.** Records show readings by day, week, month, six months or year, in the same three colours. Below the chart, each reading is listed with its time, a label such as Normal and an optional note.

![Three InForm screens: the blood sugar form with its range guide, the meal plan with Avocado Toast with Egg, and the records chart with readings coloured by range](case-studies/inform-logging.png)

_Left to right: the blood sugar form, the meal plan and the records chart. Names, dates and readings are placeholder content._

_Meal names, nutrition notes and readings in the prototype are placeholder content. This case study is about the interaction, not the nutrition data._

## 4. Design process {#design-process}

I considered a PDF export, so someone could hand their doctor a printed summary. I set it aside for this version because of file size and scope constraints. I want to find a way around them in a later one.

I also considered logging more health metrics than blood sugar, insulin and meals. I kept the set narrow to keep the app focused. Frequent data entry is a reported barrier to using diabetes apps, so each extra field has a cost.

The clearest change was to onboarding. The earlier version asked four questions over four screens, including body weight. I dropped that version when it started to feel too long for a first use. Body weight was the easiest cut: a hospital already checks and records it at every visit, so asking again added a step without adding anything new. I made that call by reviewing the flow myself, not from user testing.

The plus button puts one extra step between someone and a log: one tap to open the menu, one to choose an action. I chose it because it sits beside the navigation on every main screen, so logging is reachable from anywhere in the app. I have not tested whether that is faster than other layouts.

## 5. Challenges {#challenges}

The hardest problem was logging that someone would actually keep doing. Frequent data entry is one of the barriers reported in the research, and that research looks at who starts using diabetes apps, not who keeps using them. InForm answers this with the single plus button and short forms, so each log takes as few steps as possible, but a short form is not proof that someone will open the app on day thirty.

A few things are still unsolved. I have not tested InForm with anyone outside informal conversations, so I do not know if the logging flow is actually fast in practice. The meal names, nutrition notes and blood sugar readings in the prototype are placeholder content, not verified figures, which is fine for showing the interaction but means none of it should be read as real guidance yet. I also found the same morning's blood sugar reading shown as three different numbers across the home screen, the check screen and the reading list, a consistency bug I have since fixed in a cleaned copy of the file but which shows how easily small inconsistencies creep into a prototype built over time.

The response to these gaps is not to claim they are solved. It is to say plainly what is tested, what is placeholder, and what would need checking before this became a real product.

## 6. What's next {#whats-next}

Nothing about InForm has been measured yet, so the next step is to test it.

InForm is a prototype in Figma, and nobody beyond informal conversations has used it. What I can describe is what changed in the design. Onboarding went from four questions over four screens to three questions over two, and every log now starts from one button. I cannot yet say that either change helped.

**How I would test it.** I would run a small usability test with five people, including some who are not confident with smartphones. Each would try three tasks: log a blood sugar reading, log a meal, and find yesterday's reading. I would watch where they hesitate, listen to what they say aloud, and count how many finish without help.

I would then ask a few of them to use it for two weeks, to see whether logging continues past the first day. Five people cannot prove anything, so I would report the result as a first look, not a finding.

**What version 2 would add.**

- **A narrower audience.** Version 1 is for any adult living with diabetes. Version 2 will pick a more specific group, so the choices fit that group and not everyone.
- **Blood pressure logging.** It is not in the prototype yet. I want it because a doctor can ask a patient to track it between visits.
- **User profiles.** An option to say, for example, that you are breastfeeding, so food suggestions can fit that situation. Any real guidance would need checking by a dietitian first.
- **A summary for the doctor.** The PDF export I set aside, once I find a way around the file size.
- **Real content.** Replace the placeholder names, dates and meal data, and check the nutrition notes with a professional.

## References {#references}

1. International Diabetes Federation. (2025, 7 April). [Over 250 million people worldwide unaware they have diabetes, according to new IDF research](https://idf.org/news-and-resources/news/idf-diabetes-atlas-11th-edition/). Press release for the IDF Diabetes Atlas, 11th edition.
2. WHO Country Office Ghana, Ministry of Health, Ghana Health Service and Ghana Statistical Service. (2023). [Ghana analytic factsheet: 2023 STEPS survey findings, raised blood glucose](https://files.aho.afro.who.int/afahobckpcontainer/production/files/Raised_blood_glucose.pdf).
3. Tarricone, R., Petracca, F., Svae, L., Cucciniello, M., & Ciani, O. (2024). Which behaviour change techniques work best for diabetes self-management mobile apps? A systematic review and meta-analysis of randomised controlled trials. _eBioMedicine, 103_, 105091. [https://doi.org/10.1016/j.ebiom.2024.105091](https://doi.org/10.1016/j.ebiom.2024.105091)
4. Alaslawi, H., Berrou, I., Al Hamid, A., Alhuwail, D., & Aslanpour, Z. (2022). Diabetes self-management apps: systematic review of adoption determinants and future research agenda. _JMIR Diabetes, 7_(3), e28153. [https://doi.org/10.2196/28153](https://doi.org/10.2196/28153)
5. Perrin, N. E., Davies, M. J., Robertson, N., Snoek, F. J., & Khunti, K. (2017). The prevalence of diabetes-specific emotional distress in people with type 2 diabetes: a systematic review and meta-analysis. _Diabetic Medicine, 34_(11), 1508-1520. [https://doi.org/10.1111/dme.13448](https://doi.org/10.1111/dme.13448)
6. Caburnay, C. A., Graff, K., Harris, J. K., McQueen, A., Smith, M., Fairchild, M., & Kreuter, M. W. (2015). [Evaluating diabetes mobile applications for health literate designs and functionality, 2014](https://www.cdc.gov/pcd/issues/2015/14_0433.htm). _Preventing Chronic Disease, 12_.
7. Ghana Statistical Service. (2023). [The 2021 PHC thematic brief on digital exclusion](https://statsghana.gov.gh/gssmain/fileUpload/pressrelease/Thematic%20Brief%20on%20Digital%20Exclusion_260423a.pdf).
`,
    },

    lign: {
        name: 'Lign',
        title: 'Lign: a personalised trotro for your school or workplace',
        pdf: 'case-studies/lign-case-study.pdf',
        pdfName: 'Lign case study.pdf',
        cover: 'case-studies/lign-cover.png',
        coverAlt: 'Lign cover: "Stops lit up", rows of black star-shaped stops with a few lit in yellow, green, blue and red',
        body: `
## 1. Introduction {#introduction}

Lign is a bus app for students and workers travelling to one institution, a school, hospital, factory or company. Each rider signs in with an ID from that institution, buys tickets and books a seat on buses run for their own community.

I was the UX/UI designer on Lign, my final year project, and I also supervised the handoff to the developer who built it. The work ran through 2025 and 2026, designed entirely in Figma.

The core question: when fares and timetables feel unpredictable, what does a transport app need to give back a sense of control, without pretending to fix the roads themselves?

## 2. The problem {#the-problem}

Trotros carry around 70% of trips in Accra, so most students have no real alternative when the service is unreliable. Fares also move often: unions have announced increases of 8 to 20% within the past year alone, usually tied to fuel prices. For a student living on a termly or monthly allowance, that is hard to plan around.

I felt this directly. Fares kept rising with no warning, and drivers went on strike often enough that getting to class on time was never guaranteed. My school ran two branches, Tesano and La Paz, so missing the one bus on your side could cost a whole morning. Published research backs this up more broadly: transport problems are linked to late arrival and missed classes for students who depend on public transport.

I ran two rounds of research this year to check this wasn't just my own experience. A Google Forms survey reached 14 commuters (11 students, 3 workers) through friends. 13 named long waiting times as a problem, 13 said they just wait at the stop with no information, and 9 said they would definitely want an institutional bus. Separately, I had in-person conversations with 5 to 10 students, mostly about how fare rises affected them and what their school could do. These were casual conversations, not structured interviews, so I treat them as context rather than findings.

I also asked 2 fleet managers how they run buses today. Both already track vehicles with a GPS dashboard and want delay alerts, and both want the system to connect with the HR and payroll tools they already use. One operational pain point they raised, driver attitude, echoed what pushed me to build Lign in the first place.

I'm told that the University of Ghana and KNUST both run shuttle buses without a system like this, from a friend who studies at KNUST. I haven't confirmed this myself, so I treat it as a steer rather than a fact, and it's part of why I believe the problem isn't unique to my own school.

## 3. The app {#the-app}

Sign-in starts with an institutional ID. It unlocks the app, ties the rider to one institution's buses, and carries a role, student or teacher, so a school with both groups can run separate services. A Ghana Telecom ID will not work on a University of Ghana Legon bus, and the reverse is also true.

Tickets work as a bulk, deferred-activation model. A rider buys a set of tickets for the term in one purchase, and each ticket sits in a list as a coin. A yellow coin marked I is inactive, a green coin marked A is active. The rider long-presses a coin to activate it before boarding, so only the ticket being used that day is live.

Any tickets left unused at the end of the semester are refunded. This only works if the institution agrees to hold and return that money, so it depends on buy-in from the school or company, not just the rider.

Hop-On covers the moment the regular bus is missed. The Tickets tab has three views: Incoming, for live buses on the way, Schedules, for the week's timetable, and My Trips, for ride history. From there, Book Now opens Hop-On, which shows the nearest bus passing the rider's side, Tesano or La Paz, with seats left, ETA and distance updating live on screen.

The ETA display was not in my first version. I showed early screens to three informal testers, and they were confused about when a bus would actually arrive. Adding a live ETA, making the ticket coins show their state more clearly, and adding empty states to the tickets list and notifications, all came directly from watching that confusion.

## 4. Design process {#design-process}

I first considered making transport part of school fees, paid by the institution for every student. I rejected this. It would force fees up for everyone, including students who rarely use the buses.

Instead, Lign treats transport as its own operation. A school can run its own buses, or partner with outside investors who bring theirs, and only riders pay into it. This keeps the cost tied to use, not folded into a fee every student carries.

I assumed the ticketing side, the coin states and the Tickets tab, would be the hardest part for people to follow. When my brothers used the prototype, the opposite happened. They found My Trips, sitting inside the Tickets tab with past and ongoing trips together, more straightforward than apps like Uber, where trip history sits behind the profile. I kept that structure rather than moving it.

The trade-off I kept deliberately is the deferred-activation ticket model itself. Buying a term's worth of tickets in one go, then activating one coin at a time, adds a small extra step before boarding. I judged that step worth keeping, because it lets the refund at semester end work cleanly, unused tickets stay untouched until they are activated.

## 5. Challenges {#challenges}

The biggest constraint was scale. Lign is not one app, it is riders, drivers, fleet managers and institutions, all needing their own screens and logic, and I designed it alone.

The hardest problem was the driver side. I expected it to add 10 screens at most. Once I started designing it properly, routes, schedules, passenger counts, it kept growing well past that, and I could not finish it inside the project's timeline.

The design responds by splitting scope. The rider-facing app, sign-in, tickets, Hop-On, is complete. The driver app and the admin dashboard are pushed to version 2, rather than rushed to an unfinished state alongside the rest.

I have not solved the driver side yet. I am still building it, and still working to make the parts that exist better.

## 6. What's next {#whats-next}

Lign has not shipped. It exists as a prototype, shown so far only to three informal testers. I have not run any formal usability testing, and I want to be upfront about that rather than imply otherwise.

The activate-before-boarding pattern I designed for tickets is not new on its own. Research on mobile fare payment systems elsewhere has studied the same flow, buy a pass, activate it just before boarding, show it to be validated, and found it workable at the scale of a full transit agency. That gives me some confidence the core mechanic holds up, even though my own version hasn't been tested yet.

If I tested Lign properly, I would run structured usability sessions with students from my own school's two branches, Tesano and La Paz, since they are the actual riders the app is built for. I would watch them complete real tasks, activate a ticket, book a Hop-On bus, check a schedule, rather than ask what they think of it.

Version 2 is already in progress. It adds the driver app and the admin dashboard, plus an AI layer to help drivers navigate around congestion. I also want to build features for institutions themselves, separate from the student-facing side, so a company or hospital running its own fleet can manage it directly.

## References {#references}

1. GIZ. (2023). _Ghana Mobility Study: Mobility as a Service Opportunities_. Informal trotro transport accounts for close to 70% of work trips in Accra.
2. Agyemang, E., & others. (2026). Ghana's transport system is chaotic: how it can move more people with fewer vehicles. _The Conversation_. Over 70% of Ghanaians rely on informal transport, trotros and taxis, for daily mobility.
3. GPRTU/GRTCC fare announcements, reported in Citinewsroom and GhanaWeb (2025 to 2026). Documents fare increases of 8 to 20% tied to fuel prices over the past year.
4. World Bank. (2020). _Policy Note: Addressing Urban Mobility Challenges in Ghanaian Cities_. Covers affordability and mode choice constraints for lower-income commuters in Accra, Kumasi and Tamale.
5. Transportation and academic outcomes review, in _Educational Review_, 76(3), 2022. Longer travel times and transport challenges are linked to adverse academic outcomes, including lateness and missed classes.
6. Agbo, D., & others. The case of Paratransit: 'Trotro' service data as a credible location addressing of road networks in Ghana. _Journal of Transport Geography_ (ScienceDirect). Ghana-specific paratransit research used to ground the trotro system described here.
7. Williams, S., White, A., Waiganjo, P., Orwa, D., & Klopp, J. (2015). The digital matatu project: Using cell phones to create an open source data for Nairobi's semi-formal bus system. _Journal of Transport Geography_, 49, 39 to 51. Precedent for digitising an informal African transit system with mobile technology.
8. Yang, H., & others. (2019). An evaluation of the benefits of mobile fare payment technology from the user and operator perspectives. _Transportation Research Part A_ (ScienceDirect). Studies a buy, activate before boarding, display to validate ticketing flow, the same pattern used for Lign's ticket coins.
`,
    },
};
