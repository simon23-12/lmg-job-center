# LMG Job Center 🤖

Classroom web app: students work as researchers at the "LMG Job Center" (Director: the very lazy Mr Fuhs) and research how long it will take until four jobs can be done by AI or robots.

**Live:** https://simon23-12.github.io/lmg-job-center/

- Optimised for iPad (Safari), works in any modern browser
- No backend: answers are saved in the browser's `localStorage` on the device
- Progress bar for the four job files, consulting report (print / PDF), export as text
- Small Three.js scene of Mr Fuhs' office (tap Mr Fuhs or the robot)

## For teachers

Each student gets **one job from each of four tiers** (picked from the name they enter, so the same name always gives the same jobs):

| Tier | Exposure to automation | Jobs |
|---|---|---|
| A | very high | Call Center Agent, Translator, Data Entry Clerk, Bookkeeper, Supermarket Cashier, Telemarketer, Proofreader, Warehouse Picker |
| B | high / medium | Truck Driver, Graphic Designer, Software Developer, Bank Clerk, Journalist, Radiologist, Insurance Clerk, Tax Advisor |
| C | medium / low | Teacher, Lawyer, Pharmacist, Architect, Chef, Police Officer, Photographer, Real Estate Agent |
| D | low | Nurse, Plumber, Electrician, Kindergarten Teacher, Psychotherapist, Hairdresser, Firefighter, Elderly Care Worker |

The tiers are not shown to students. A job file counts as complete when it has: job tasks, ≥ 2 arguments for, ≥ 2 arguments against, a time estimate and advice.

Jobs can be edited in `jobs.js`.
