// Job pool, grouped by how exposed the job is to automation.
// The tier is NOT shown to students – they have to find that out themselves.
// Every student gets exactly one job from each tier (in shuffled order).
export const TIERS = {
  A: 'very high exposure',
  B: 'high / medium exposure',
  C: 'medium / low exposure',
  D: 'low exposure',
};

export const JOBS = [
  // Tier A – large parts are already automatable today
  { id: 'callcenter', tier: 'A', icon: '🎧', title: 'Call Center Agent', desc: 'Answers customer calls and chats, solves standard problems, forwards complicated cases.', hints: ['Which questions do customers ask again and again?', 'What can voice bots and chatbots already do today?', 'What happens when a customer is angry or confused?'] },
  { id: 'translator', tier: 'A', icon: '🌍', title: 'Translator', desc: 'Translates texts such as manuals, contracts, websites or books into other languages.', hints: ['How good are tools like DeepL today?', 'Who is responsible if a translated contract contains a mistake?', 'Is translating poetry or jokes different from translating manuals?'] },
  { id: 'dataentry', tier: 'A', icon: '⌨️', title: 'Data Entry Clerk', desc: 'Types information from forms, invoices and documents into computer systems.', hints: ['Can software read scanned documents?', 'How often does the work look exactly the same?', 'What happens with unreadable handwriting?'] },
  { id: 'bookkeeper', tier: 'A', icon: '📒', title: 'Bookkeeper', desc: 'Records income and expenses, sorts receipts and prepares numbers for the tax office.', hints: ['Which accounting tasks follow fixed rules?', 'Do banks already sort transactions automatically?', 'Who checks that everything is legal?'] },
  { id: 'cashier', tier: 'A', icon: '🛒', title: 'Supermarket Cashier', desc: 'Scans products, takes payments and helps customers at the checkout.', hints: ['Have you seen self-checkouts? How well do they work?', 'What does a cashier do besides scanning?', 'Who helps older customers?'] },
  { id: 'telemarketer', tier: 'A', icon: '📞', title: 'Telemarketer', desc: 'Calls people to sell products, subscriptions or contracts over the phone.', hints: ['Can an AI voice sound like a human?', 'Is it legal for a bot to call people?', 'Do people trust sales calls?'] },
  { id: 'proofreader', tier: 'A', icon: '🔍', title: 'Proofreader', desc: 'Checks texts for spelling, grammar and style before they are published.', hints: ['What do spell checkers and AI writing tools already catch?', 'What about style, tone and facts?', 'Who decides when a text is "good"?'] },
  { id: 'stockclerk', tier: 'A', icon: '📦', title: 'Warehouse Picker', desc: 'Collects ordered goods from shelves in a warehouse and prepares them for shipping.', hints: ['How do big online shops run their warehouses?', 'Which items are hard for robots to grab?', 'How expensive are warehouse robots?'] },

  // Tier B – a lot is changing, but not everything is replaceable
  { id: 'truckdriver', tier: 'B', icon: '🚚', title: 'Truck Driver', desc: 'Transports goods over long distances on highways and delivers them to customers.', hints: ['Where are self-driving trucks already being tested?', 'What about laws and accidents?', 'What does a driver do besides driving?'] },
  { id: 'graphicdesigner', tier: 'B', icon: '🎨', title: 'Graphic Designer', desc: 'Creates logos, posters, advertisements and layouts for companies.', hints: ['What can image generators like Midjourney do?', 'Who understands what the customer really wants?', 'Is "good taste" automatable?'] },
  { id: 'developer', tier: 'B', icon: '💻', title: 'Software Developer', desc: 'Writes, tests and maintains computer programs and apps.', hints: ['How much code can AI write today?', 'Who decides WHAT a program should do?', 'Who fixes it when the AI code breaks?'] },
  { id: 'bankclerk', tier: 'B', icon: '🏦', title: 'Bank Clerk', desc: 'Advises customers about accounts, loans and savings, handles transactions.', hints: ['How many bank branches have closed in the last 10 years?', 'What can you do in a banking app?', 'Do people want a human for big decisions like a house loan?'] },
  { id: 'journalist', tier: 'B', icon: '📰', title: 'Journalist', desc: 'Researches news, interviews people and writes articles or reports.', hints: ['Some sports and stock reports are already written by AI – which ones?', 'Can an AI do an interview on location?', 'What about fake news and trust?'] },
  { id: 'radiologist', tier: 'B', icon: '🩻', title: 'Radiologist', desc: 'A doctor who looks at X-rays, MRI and CT scans to find diseases.', hints: ['How well does AI detect cancer on images?', 'Who is responsible for a wrong diagnosis?', 'Does a radiologist also talk to patients?'] },
  { id: 'insurance', tier: 'B', icon: '📋', title: 'Insurance Clerk', desc: 'Checks insurance claims, calculates payments and answers customer questions.', hints: ['Which claims are simple standard cases?', 'How can fraud be detected?', 'What about unusual cases?'] },
  { id: 'taxadvisor', tier: 'B', icon: '🧾', title: 'Tax Advisor', desc: 'Helps people and companies with their tax returns and saves them money legally.', hints: ['Can tax software already do simple tax returns?', 'How often do tax laws change?', 'Do companies want a person they can trust?'] },

  // Tier C – AI changes the job, but humans remain central
  { id: 'teacher', tier: 'C', icon: '🧑‍🏫', title: 'Teacher', desc: 'Teaches students, plans lessons, grades work and supports young people.', hints: ['What can an AI tutor do better than a teacher?', 'What can a teacher do that an AI cannot?', 'What about classroom management and motivation?'] },
  { id: 'lawyer', tier: 'C', icon: '⚖️', title: 'Lawyer', desc: 'Advises clients on legal questions, writes contracts and represents people in court.', hints: ['Which legal research can AI do?', 'Could an AI speak in court?', 'Why do clients need trust?'] },
  { id: 'pharmacist', tier: 'C', icon: '💊', title: 'Pharmacist', desc: 'Hands out medicine, checks prescriptions and advises customers about side effects.', hints: ['Are there pharmacy robots and online pharmacies?', 'Who checks dangerous drug combinations?', 'Who advises an unsure elderly customer?'] },
  { id: 'architect', tier: 'C', icon: '🏛️', title: 'Architect', desc: 'Designs buildings, plans rooms and supervises construction projects.', hints: ['Can AI generate floor plans?', 'Who talks to the city, builders and clients?', 'What about creativity and local rules?'] },
  { id: 'chef', tier: 'C', icon: '👨‍🍳', title: 'Chef', desc: 'Cooks meals in a restaurant, creates new dishes and leads the kitchen team.', hints: ['Are there burger or pizza robots already?', 'Can a robot taste food?', 'What about creativity and leading a team?'] },
  { id: 'police', tier: 'C', icon: '👮', title: 'Police Officer', desc: 'Keeps people safe, investigates crimes and helps in emergencies.', hints: ['Which tasks could cameras, drones and AI take over?', 'Would you accept a robot police officer?', 'What about calming down conflicts?'] },
  { id: 'photographer', tier: 'C', icon: '📷', title: 'Photographer', desc: 'Takes photos at weddings, events, for companies or newspapers.', hints: ['Can AI generate photos of events that really happened?', 'What about a wedding – could it be AI-generated?', 'Which kinds of photography are most at risk?'] },
  { id: 'realestate', tier: 'C', icon: '🏠', title: 'Real Estate Agent', desc: 'Helps people buy, sell or rent flats and houses.', hints: ['What do online property platforms already do?', 'Who shows the flat and negotiates the price?', 'Why is trust important when buying a house?'] },

  // Tier D – hard to automate (physical, social, unpredictable)
  { id: 'nurse', tier: 'D', icon: '🩺', title: 'Nurse', desc: 'Cares for sick people in hospitals, gives medicine and supports patients and families.', hints: ['Which nursing tasks are physical?', 'Are there care robots in Japan?', 'How important is empathy?'] },
  { id: 'plumber', tier: 'D', icon: '🔧', title: 'Plumber', desc: 'Installs and repairs water pipes, heating systems and bathrooms.', hints: ['Is every house built the same way?', 'How good are robots in tight, messy spaces?', 'Could AI help a plumber instead of replacing them?'] },
  { id: 'electrician', tier: 'D', icon: '⚡', title: 'Electrician', desc: 'Installs electrical systems, solar panels and charging stations, finds faults.', hints: ['Why is there a shortage of electricians?', 'How unpredictable is each job?', 'What about safety rules?'] },
  { id: 'kindergarten', tier: 'D', icon: '🧸', title: 'Kindergarten Teacher', desc: 'Takes care of small children, plays with them and supports their development.', hints: ['Would parents leave their kids with a robot?', 'What do small children need most?', 'Which admin tasks could AI help with?'] },
  { id: 'therapist', tier: 'D', icon: '🛋️', title: 'Psychotherapist', desc: 'Helps people with mental health problems through conversations and therapy.', hints: ['There are AI therapy chatbots – are they good?', 'What about crises and responsibility?', 'Why is a human relationship important in therapy?'] },
  { id: 'hairdresser', tier: 'D', icon: '✂️', title: 'Hairdresser', desc: 'Cuts, colours and styles hair and advises customers on their look.', hints: ['Is every head and hair type different?', 'Do people go to the hairdresser just for the haircut?', 'Has anyone built a hair-cutting robot?'] },
  { id: 'firefighter', tier: 'D', icon: '🚒', title: 'Firefighter', desc: 'Fights fires, rescues people and helps in accidents and disasters.', hints: ['Where are drones and robots already used in firefighting?', 'How unpredictable is an emergency?', 'Who makes split-second decisions?'] },
  { id: 'eldercare', tier: 'D', icon: '👵', title: 'Elderly Care Worker', desc: 'Supports old people with daily life: washing, eating, moving and company.', hints: ['Germany has a huge lack of care workers – why?', 'What can robots like "Pepper" or lifting aids do?', 'What about loneliness and dignity?'] },
];

export const ESTIMATES = [
  { value: 1, label: 'less than 3 years' },
  { value: 2, label: '3 – 5 years' },
  { value: 3, label: '5 – 10 years' },
  { value: 4, label: '10 – 20 years' },
  { value: 5, label: 'more than 20 years' },
  { value: 6, label: 'probably never fully' },
];
