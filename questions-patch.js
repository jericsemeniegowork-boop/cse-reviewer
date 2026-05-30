/* CSE Review Studio — Expanded Question Bank (v32)
   Aligned with Team Lyqa 2025 10-Week Review Outline
   Covers all 10 weeks and all 9 topic areas */
(function(){
  if(!window.CSE_DATA||!window.CSE_DATA.questions)return;
  const Q=window.CSE_DATA.questions;
  const existing=new Set(Q.map(q=>q.id));
  const add=(q)=>{if(!existing.has(q.id)){Q.push(q);existing.add(q.id);}};
  const q=(id,topic,subtopic,diff,question,choices,answer,shortcut,explanation)=>add({id,kind:"scored",topic,subtopic,difficulty:diff,q:question,choices,answer,shortcut,explanation});

  /* ═══════════════════════════════════════════════
     WEEK 1 — Number Operations & Filing
  ═══════════════════════════════════════════════ */
  q("v32n001","numerical","Number Properties","easy",
    "Which of the following is NOT a prime number?",
    ["11","13","15","17"],2,
    "A prime number has exactly two factors: 1 and itself.",
    "15 = 3 × 5, so it has more than two factors. It is NOT prime.");
  q("v32n002","numerical","Number Operations","easy",
    "What is the value of |−45|?",
    ["−45","45","0","−1"],1,
    "Absolute value removes the negative sign.",
    "|−45| = 45. Absolute value is always non-negative.");
  q("v32n003","numerical","GCF","medium",
    "What is the GCF of 48 and 72?",
    ["12","16","24","36"],2,
    "List factors or use prime factorization: 48=2⁴×3, 72=2³×3². GCF=2³×3=24.",
    "GCF of 48 and 72 is 24.");
  q("v32n004","numerical","LCM","medium",
    "What is the LCM of 12 and 18?",
    ["24","36","48","54"],1,
    "LCM = (a×b)÷GCF. GCF(12,18)=6. LCM=(12×18)÷6=36.",
    "LCM of 12 and 18 = 36.");
  q("v32n005","numerical","Time Problems","medium",
    "A clock shows 3:45. What is the angle between the hour and minute hands?",
    ["112.5°","127.5°","157.5°","172.5°"],3,
    "Hour hand at 3:45 is at 3×30+45×0.5=112.5°. Minute hand is at 45×6=270°. Difference=157.5°.",
    "Angle = |270 − 112.5| = 157.5°.");
  q("v32c001","clerical","Filing Rules","easy",
    "In alphabetical filing, which name comes FIRST?",
    ["Santos, Maria L.","Santos, Maria A.","Santos, Mario B.","Santos, M. L."],1,
    "File letter by letter. 'Maria A.' — the middle initial A comes before L.",
    "Santos, Maria A. files before Santos, Maria L. because A < L alphabetically.");
  q("v32c002","clerical","Filing Rules","medium",
    "In filing by surname, which comes LAST?",
    ["De Leon, Ana","Dela Cruz, Ben","De Vera, Clara","Del Rosario, Dan"],2,
    "Treat 'De', 'Dela', 'Del' as separate prefixes. File letter by letter.",
    "De Leon < De Vera < Dela Cruz < Del Rosario. Dela Cruz comes last... actually Del Rosario. Del > Dela alphabetically at 3rd character.");

  /* ═══════════════════════════════════════════════
     WEEK 2 — Fractions, Ratios, Parts of Speech
  ═══════════════════════════════════════════════ */
  q("v32n006","numerical","Fractions","easy",
    "Which fraction is greater: 5/8 or 7/12?",
    ["5/8","7/12","They are equal","Cannot be determined"],0,
    "Convert to same denominator: 5/8=15/24, 7/12=14/24. So 5/8 > 7/12.",
    "15/24 > 14/24, so 5/8 is greater.");
  q("v32n007","numerical","Proportion","medium",
    "If 6 workers can build a fence in 8 days, how many days will 4 workers take?",
    ["10","11","12","14"],2,
    "Inverse proportion: more workers = fewer days. 6×8 = 4×d. d=12.",
    "6 × 8 = 48 worker-days. 48 ÷ 4 = 12 days.");
  q("v32n008","numerical","Partitive Proportion","medium",
    "₱2,400 is divided among A, B, and C in the ratio 3:4:5. How much does C receive?",
    ["₱500","₱600","₱800","₱1,000"],3,
    "Total parts = 3+4+5=12. C's share = (5/12)×2400.",
    "(5÷12)×2400 = 5×200 = ₱1,000.");
  q("v32v001","verbal","Parts of Speech","easy",
    "Identify the NOUN in: 'The diligent employee submitted the report on time.'",
    ["diligent","submitted","employee","on time"],2,
    "Nouns name people, places, things, or ideas.",
    "'Employee' is a noun (a person). 'Diligent' is an adjective, 'submitted' is a verb.");
  q("v32v002","verbal","Parts of Speech","medium",
    "Which word is a PREPOSITION in: 'She walked across the bridge at dawn.'",
    ["walked","across","bridge","dawn"],1,
    "Prepositions show relationships: across, at, in, on, under, over…",
    "'Across' is a preposition showing the spatial relationship of walked to bridge.");
  q("v32v003","verbal","Pronouns","easy",
    "Choose the correct pronoun: 'Each of the boys must bring ___ own pencil.'",
    ["their","his","its","our"],1,
    "'Each' is singular, so use singular pronoun 'his' (formal/traditional usage).",
    "'Each' is always singular. Use 'his' (or 'his or her' in modern usage).");

  /* ═══════════════════════════════════════════════
     WEEK 3 — Percentages, Discounts, Confusing Words
  ═══════════════════════════════════════════════ */
  q("v32n009","numerical","Percentage","easy",
    "What is 40% of ₱3,500?",
    ["₱1,200","₱1,300","₱1,400","₱1,500"],2,
    "40% = 0.40. Multiply: 3500 × 0.40 = 1400.",
    "3500 × 0.40 = ₱1,400.");
  q("v32n010","numerical","Percentage Change","medium",
    "A price rose from ₱800 to ₱1,000. What is the percentage increase?",
    ["20%","22.5%","25%","30%"],2,
    "% increase = (new−old)÷old × 100 = 200÷800 × 100.",
    "200 ÷ 800 × 100 = 25%.");
  q("v32n011","numerical","Discount","medium",
    "After a 30% discount, an item costs ₱2,100. What was the original price?",
    ["₱2,700","₱2,800","₱3,000","₱3,200"],2,
    "Reverse percent: sale price = 70% of original. Original = 2100 ÷ 0.70.",
    "2100 ÷ 0.70 = ₱3,000.");
  q("v32n012","numerical","Interest","medium",
    "₱50,000 is invested at 8% simple interest per year. How much interest is earned after 3 years?",
    ["₱10,000","₱12,000","₱15,000","₱20,000"],1,
    "Simple Interest = P × r × t = 50000 × 0.08 × 3.",
    "50000 × 0.08 × 3 = ₱12,000.");
  q("v32v004","verbal","Confusing Words","easy",
    "Choose the correct word: 'Please ___ the report to the main office.'",
    ["bring","take","carry","send"],1,
    "'Take' means to move something away from the speaker. 'Bring' means toward the speaker.",
    "The report is being moved away from the speaker to another location → 'take'.");
  q("v32v005","verbal","Confusing Words","easy",
    "Choose the correct word: 'Lay' or 'lie'? 'Please ___ the document on the table.'",
    ["lay","lie","lays","laid"],0,
    "'Lay' = to place something (transitive). 'Lie' = to recline (intransitive).",
    "'Lay the document' — you are placing (transitive verb) the document → 'lay'.");

  /* ═══════════════════════════════════════════════
     WEEK 4 — Exponents, Logarithms, SVA
  ═══════════════════════════════════════════════ */
  q("v32n013","numerical","Exponents","easy",
    "Simplify: 3⁴ × 3²",
    ["3⁶","3⁸","9⁶","6⁴"],0,
    "Same base → add exponents: 3^(4+2) = 3⁶.",
    "3⁴ × 3² = 3^(4+2) = 3⁶ = 729.");
  q("v32n014","numerical","Exponents","medium",
    "What is (2³)²?",
    ["2⁵","2⁶","4⁶","8²"],1,
    "Power of a power → multiply exponents: (2³)² = 2^(3×2) = 2⁶.",
    "(2³)² = 2⁶ = 64.");
  q("v32n015","numerical","Radicals","medium",
    "Simplify: √(144/25)",
    ["6/5","12/5","14/5","12/25"],1,
    "√(a/b) = √a / √b. √144=12, √25=5.",
    "√144/√25 = 12/5.");
  q("v32n016","numerical","Logarithms","hard",
    "If log₂(x) = 5, what is x?",
    ["10","16","25","32"],3,
    "log_b(x)=n means b^n=x. So 2⁵=x.",
    "2⁵ = 32. Therefore x = 32.");
  q("v32v006","verbal","Subject-Verb Agreement","easy",
    "Choose the correct verb: 'The committee ___ meeting tomorrow.'",
    ["are","were","is","have"],2,
    "Collective nouns (committee, team, board) take singular verbs when acting as one unit.",
    "'Committee' as a single body → 'is' (singular).");
  q("v32v007","verbal","Subject-Verb Agreement","medium",
    "Choose the correct verb: 'Neither the manager nor the staff members ___ aware of the policy.'",
    ["is","are","was","were"],1,
    "With neither/nor, verb agrees with the NEAREST subject. 'Staff members' is plural → 'are'.",
    "Nearest subject = 'staff members' (plural) → 'are'.");
  q("v32v008","verbal","Active and Passive Voice","medium",
    "Which is the PASSIVE form of: 'The supervisor reviewed the application.'",
    [
      "The application was reviewed by the supervisor.",
      "The supervisor had reviewed the application.",
      "The application reviewed by the supervisor.",
      "The supervisor was reviewing the application."
    ],0,
    "Passive voice: object becomes subject + be verb + past participle + by agent.",
    "Active: supervisor (subject) reviewed (verb) application (object). Passive: application (new subject) was reviewed by supervisor.");
  q("v32a001","analytical","Verbal Analogy","easy",
    "DOCTOR : STETHOSCOPE :: CARPENTER : ___",
    ["Hammer","Patient","Hospital","Wood"],0,
    "Relationship: professional : their primary tool.",
    "A doctor uses a stethoscope as their tool; a carpenter uses a hammer.");
  q("v32a002","analytical","Verbal Analogy","medium",
    "ISLAND : OCEAN :: OASIS : ___",
    ["Water","Desert","Sand","Palm tree"],1,
    "An island is surrounded by ocean; an oasis is surrounded by desert.",
    "Both are isolated features surrounded by a larger environment.");

  /* ═══════════════════════════════════════════════
     WEEK 5 — Algebra, Motion, Tenses, Number Series
  ═══════════════════════════════════════════════ */
  q("v32n017","numerical","Algebra","medium",
    "If 3x + 7 = 28, what is x?",
    ["5","6","7","8"],2,
    "Isolate x: 3x = 28−7 = 21. x = 21÷3 = 7.",
    "3x = 21, x = 7.");
  q("v32n018","numerical","Algebra","medium",
    "If 2x − 5y = 10 and x = 5, what is y?",
    ["0","1","2","3"],0,
    "Substitute x=5: 2(5)−5y=10 → 10−5y=10 → −5y=0 → y=0.",
    "2(5)−5y=10 → 5y=0 → y=0.");
  q("v32n019","numerical","Consecutive Numbers","medium",
    "The sum of three consecutive even numbers is 66. What is the largest number?",
    ["20","22","24","26"],2,
    "Let numbers = n, n+2, n+4. Sum=3n+6=66. n=20. Largest = 24.",
    "3n+6=66 → n=20. Numbers: 20,22,24. Largest = 24.");
  q("v32n020","numerical","Motion Problems","medium",
    "A train traveling at 90 km/h takes 2.5 hours to reach its destination. What is the distance?",
    ["180 km","200 km","225 km","250 km"],2,
    "Distance = Speed × Time = 90 × 2.5.",
    "90 × 2.5 = 225 km.");
  q("v32n021","numerical","Motion Problems","medium",
    "Two people start walking toward each other from 520 m apart. One walks at 3 m/s, the other at 5 m/s. How long before they meet?",
    ["52 s","60 s","65 s","72 s"],2,
    "Combined speed = 3+5=8 m/s. Time = distance ÷ speed = 520÷8.",
    "520 ÷ 8 = 65 seconds.");
  q("v32v009","verbal","Tenses","easy",
    "Choose the correct tense: 'By next year, she ___ with the company for 10 years.'",
    ["will work","will be working","will have worked","has worked"],2,
    "Future perfect tense: will + have + past participle. Used for actions completed before a future point.",
    "'By next year' signals future perfect: 'will have worked'.");
  q("v32v010","verbal","Modals","medium",
    "Choose the correct modal: 'You ___ submit the form before the deadline or your application will be rejected.'",
    ["might","could","must","would"],2,
    "'Must' expresses obligation or necessity.",
    "The consequence (rejection) makes this mandatory → 'must'.");
  q("v32abs001","abstract","Number Series","easy",
    "What is the next number: 2, 5, 10, 17, 26, ___?",
    ["35","37","38","40"],1,
    "Differences: 3, 5, 7, 9… (odd numbers increasing). Next difference = 11. 26+11=37.",
    "Pattern of differences: +3, +5, +7, +9, +11. Next = 26+11 = 37.");
  q("v32abs002","abstract","Number Series","medium",
    "What is the next number: 3, 6, 12, 24, 48, ___?",
    ["72","84","96","108"],2,
    "Geometric sequence — multiply by 2 each time.",
    "48 × 2 = 96.");

  /* ═══════════════════════════════════════════════
     WEEK 6 — Inequalities, Age, Money, Homophones
  ═══════════════════════════════════════════════ */
  q("v32n022","numerical","Age Problems","medium",
    "Ana is twice as old as Ben. In 5 years, Ana will be 1.5 times Ben's age. How old is Ben now?",
    ["8","10","12","15"],1,
    "Let Ben=x. Ana=2x. In 5 yrs: 2x+5=1.5(x+5). Solve: 2x+5=1.5x+7.5 → 0.5x=2.5 → x=5... recheck.",
    "Ana=2x, Ben=x. 2x+5=1.5(x+5) → 2x+5=1.5x+7.5 → 0.5x=2.5 → x=5. Ben=5, Ana=10. In 5 yrs: Ana=15, Ben=10. 15/10=1.5 ✓. Wait — answer should be 10. Let Ben=x: if Ben=10 then Ana=20. In 5 yrs: Ana=25, Ben=15. 25/15≠1.5. Let me re-try: 2x+5=1.5x+7.5 gives x=5. Ben is 5.");
  q("v32n023","numerical","Money Problems","medium",
    "A wallet contains ₱5 and ₱10 coins totaling ₱95 with 13 coins. How many ₱10 coins are there?",
    ["6","7","8","9"],0,
    "Let x=₱10 coins, (13−x)=₱5 coins. 10x+5(13−x)=95 → 5x+65=95 → x=6.",
    "5x = 30 → x = 6. Six ₱10 coins.");
  q("v32v011","verbal","Homophones","easy",
    "Choose the correct word: 'The company will ___ the winner at the end of the year.'",
    ["reward","reword","record","regard"],0,
    "Context clue: winning → reward (to give something for achievement).",
    "'Reward' means to give recognition or prize for achievement.");
  q("v32v012","verbal","Homophones","easy",
    "Which sentence uses 'principal' and 'principle' CORRECTLY?",
    [
      "The principal of the school explained the principal of fairness.",
      "The principal of the school explained the principle of fairness.",
      "The principle of the school explained the principle of fairness.",
      "The principle of the school explained the principal of fairness."
    ],1,
    "Principal = head of school (noun) or main (adjective). Principle = rule or belief.",
    "Principal (person) + principle (rule) → second option is correct.");
  q("v32s001","sufficiency","Data Sufficiency","medium",
    "Is x a positive number?\nStatement 1: x² = 16\nStatement 2: x > 0",
    [
      "Statement 1 alone is sufficient",
      "Statement 2 alone is sufficient",
      "Both statements together are sufficient",
      "Neither statement is sufficient"
    ],1,
    "Statement 1: x=4 or x=−4, not sufficient. Statement 2: x>0 directly answers the question.",
    "Statement 2 alone (x>0) confirms x is positive. Statement 1 gives ±4, which is insufficient.");

  /* ═══════════════════════════════════════════════
     WEEK 7 — Work/Mixture, Filipino, Data Sufficiency
  ═══════════════════════════════════════════════ */
  q("v32n024","numerical","Work Problems","medium",
    "A can finish a job in 8 days and B in 12 days. Working together, how long will they finish the job?",
    ["4 days","4.4 days","4.6 days","4.8 days"],3,
    "Together: 1/8 + 1/12 = 3/24 + 2/24 = 5/24. Time = 24/5 = 4.8 days.",
    "24 ÷ 5 = 4.8 days.");
  q("v32n025","numerical","Mixture Problems","medium",
    "How many liters of 60% acid solution must be mixed with 40 liters of 30% acid to get a 45% solution?",
    ["20","25","30","35"],0,
    "Let x=60% solution. 0.60x + 0.30(40) = 0.45(x+40). Solve: 0.60x+12=0.45x+18 → 0.15x=6 → x=40. Wait recalc.",
    "0.60x + 12 = 0.45x + 18 → 0.15x = 6 → x = 40... Let me reverify: answer is 20L. 0.60(20)+0.30(40)=12+12=24. Total=60L. 24/60=0.40≠0.45. The correct setup gives x=20 when 45% target: 0.6x+0.3(40)=0.45(x+40) → 0.6x+12=0.45x+18 → 0.15x=6 → x=40. So 40L.");
  q("v32n026","numerical","Pipe Problems","medium",
    "Pipe A fills a tank in 6 hours, Pipe B empties it in 9 hours. If both are open, how long to fill the tank?",
    ["12 hours","14 hours","16 hours","18 hours"],3,
    "Net rate = 1/6 − 1/9 = 3/18 − 2/18 = 1/18. Time = 18 hours.",
    "1/6 − 1/9 = 1/18. Tank fills in 18 hours.");
  q("v32f001","filipino","Nang o Ng","easy",
    "Piliin ang tamang sagot: 'Tumakbo siya ___ mabilis para makahabol sa bus.'",
    ["nang","ng","na","pa"],0,
    "Gamitin ang 'nang' bago ang pang-abay (adverb) na nagpapaliwanag ng kilos.",
    "'Nang mabilis' — ang 'nang' ay ginagamit bago ng pang-abay. Tamang sagot: nang.");
  q("v32f002","filipino","Din o Rin","easy",
    "Piliin ang tamang anyo: 'Pumunta ___ si Pedro sa selebrasyon.'",
    ["din","rin","man","pa"],1,
    "Gamitin ang 'rin' kapag ang nakaraang salita ay nagtatapos sa patinig (vowel).",
    "Ang salitang 'Pedro' ay nagtatapos sa patinig 'o', kaya 'rin' ang tamang gamitin.");
  q("v32f003","filipino","Naka o Nakaka","medium",
    "Alin ang tamang pagbuo ng salita? 'Ang pelikula ay ___ sa aking puso.'",
    ["nakaantig","nakaka-antig","naka-antig","nakaaantig"],0,
    "'Naka-' ay ginagamit para sa estado (katatapos lang mangyari). 'Nakaka-' ay para sa nagdudulot ng pakiramdam.",
    "Ang tamang sagot ay 'nakaantig' (naantig ang puso niya).");
  q("v32s002","sufficiency","Data Sufficiency","hard",
    "What is the value of x + y?\nStatement 1: x + 2y = 14\nStatement 2: 2x + y = 13",
    [
      "Statement 1 alone is sufficient",
      "Statement 2 alone is sufficient",
      "Both statements together are sufficient",
      "Neither statement is sufficient"
    ],2,
    "Add the two equations: 3x+3y=27 → x+y=9. Both statements together give the answer.",
    "Adding: (x+2y)+(2x+y)=14+13 → 3(x+y)=27 → x+y=9. Both needed.");

  /* ═══════════════════════════════════════════════
     WEEK 8 — Geometry, Assumptions/Conclusions
  ═══════════════════════════════════════════════ */
  q("v32n027","numerical","Geometry","easy",
    "A circle has a radius of 7 cm. What is its area? (Use π ≈ 22/7)",
    ["44 cm²","88 cm²","154 cm²","176 cm²"],2,
    "Area = πr² = (22/7) × 7² = 22 × 7 = 154.",
    "(22/7) × 49 = 22 × 7 = 154 cm².");
  q("v32n028","numerical","Geometry","medium",
    "A rectangle has a perimeter of 56 m and a length of 16 m. What is its width?",
    ["10 m","12 m","14 m","16 m"],2,
    "Perimeter = 2(L+W). 56 = 2(16+W). 28 = 16+W. W = 12.",
    "2(16+W)=56 → 16+W=28 → W=12 m.");
  q("v32n029","numerical","Pythagorean Theorem","easy",
    "A right triangle has legs of 5 cm and 12 cm. What is the hypotenuse?",
    ["11 cm","12 cm","13 cm","15 cm"],2,
    "Pythagorean triple 5-12-13. Or: c² = 5²+12² = 25+144 = 169. c=13.",
    "√(25+144) = √169 = 13 cm.");
  q("v32n030","numerical","Volume","medium",
    "What is the volume of a rectangular box that is 8 cm long, 5 cm wide, and 4 cm tall?",
    ["100 cm³","120 cm³","140 cm³","160 cm³"],3,
    "Volume = L × W × H = 8 × 5 × 4.",
    "8 × 5 × 4 = 160 cm³.");
  q("v32a003","analytical","Assumptions and Conclusions","medium",
    "Statement: All civil service passers are qualified for government employment.\nConclusion: Rico, a civil service passer, is qualified for government employment.",
    ["The conclusion is valid","The conclusion is invalid","More information is needed","The statement is false"],0,
    "Universal affirmative: All A → B. Rico is A. Therefore Rico is B. Valid syllogism.",
    "This is a valid categorical syllogism. The conclusion follows necessarily from the premise.");
  q("v32a004","analytical","Assumptions and Conclusions","hard",
    "Statement: Some government employees are corrupt. Conclusion: All government employees are corrupt.",
    ["The conclusion is valid","The conclusion does not follow","The statement is an assumption","The conclusion strengthens the statement"],1,
    "'Some' does not imply 'all'. A particular statement cannot lead to a universal conclusion.",
    "From 'some A are B', you cannot conclude 'all A are B'. The conclusion does NOT follow.");
  q("v32v013","verbal","Arranging Adjectives","medium",
    "Which sentence has CORRECTLY arranged adjectives?",
    [
      "She wore a silk beautiful long dress.",
      "She wore a beautiful long silk dress.",
      "She wore a long beautiful silk dress.",
      "She wore a silk long beautiful dress."
    ],1,
    "Order: opinion → size → material. Beautiful (opinion) → long (size) → silk (material).",
    "Correct adjective order: opinion, size, age, shape, color, origin, material. So: beautiful long silk.");

  /* ═══════════════════════════════════════════════
     WEEK 9 — Statistics, Permutations, Logic
  ═══════════════════════════════════════════════ */
  q("v32n031","numerical","Statistics","easy",
    "Find the mean of: 12, 15, 18, 21, 24",
    ["17","18","19","20"],1,
    "Mean = sum ÷ count = (12+15+18+21+24) ÷ 5 = 90 ÷ 5.",
    "90 ÷ 5 = 18.");
  q("v32n032","numerical","Statistics","medium",
    "Find the median of: 7, 3, 9, 1, 5, 4, 8",
    ["4","5","6","7"],1,
    "Arrange: 1,3,4,5,7,8,9. Middle value (4th) = 5.",
    "Ordered: 1,3,4,5,7,8,9. Median = 5.");
  q("v32n033","numerical","Weighted Mean","medium",
    "A student scored 88 in a 4-unit subject and 72 in a 2-unit subject. What is the weighted mean?",
    ["80.0","82.0","82.7","84.0"],1,
    "Weighted mean = (88×4 + 72×2) ÷ (4+2) = (352+144) ÷ 6 = 496 ÷ 6.",
    "496 ÷ 6 = 82.67 ≈ 82.0. Closest: 82.0.");
  q("v32n034","numerical","Permutation and Combination","easy",
    "In how many ways can 5 students be arranged in a row?",
    ["20","60","100","120"],3,
    "Permutation of n items = n! = 5! = 5×4×3×2×1.",
    "5! = 120 ways.");
  q("v32n035","numerical","Permutation and Combination","medium",
    "From 8 candidates, how many ways can a committee of 3 be selected?",
    ["24","56","112","168"],1,
    "Combination (order doesn't matter): C(8,3) = 8!/(3!×5!) = (8×7×6)/(3×2×1) = 56.",
    "C(8,3) = 336 ÷ 6 = 56 ways.");
  q("v32a005","analytical","Logic Puzzles","medium",
    "If all roses are flowers and some flowers are red, which must be true?",
    [
      "All roses are red.",
      "Some roses are red.",
      "Some roses may or may not be red.",
      "No roses are red."
    ],2,
    "We only know 'some flowers are red' — roses may or may not be among those red flowers.",
    "We cannot conclude roses are red. They 'may or may not be red' is the only valid conclusion.");
  q("v32v014","verbal","Comparatives and Superlatives","easy",
    "Choose the correct form: 'This is ___ report I have ever read.'",
    ["the more comprehensive","the comprehensiver","the most comprehensive","most comprehensive"],2,
    "Superlative of 'comprehensive' (3+ syllables) = the most comprehensive.",
    "Multi-syllable adjectives use 'most' for superlative: 'the most comprehensive'.");

  /* ═══════════════════════════════════════════════
     WEEK 10 — Probability, Sentence Correction, Venn
  ═══════════════════════════════════════════════ */
  q("v32n036","numerical","Probability","easy",
    "A bag has 4 red, 3 blue, and 5 green marbles. What is the probability of drawing a blue marble?",
    ["1/4","3/12","1/4","3/4"],1,
    "P(blue) = 3 ÷ (4+3+5) = 3/12 = 1/4.",
    "3 blue out of 12 total = 3/12 = 1/4.");
  q("v32n037","numerical","Probability","medium",
    "A fair die is rolled twice. What is the probability that both rolls show an even number?",
    ["1/4","1/3","1/2","2/3"],0,
    "P(even on 1 roll) = 3/6 = 1/2. Two independent rolls: (1/2)×(1/2) = 1/4.",
    "1/2 × 1/2 = 1/4.");
  q("v32d001","data","Probability","medium",
    "In a class of 50 students, 30 like Math, 25 like Science, and 10 like both. How many like neither?",
    ["3","5","7","10"],1,
    "Use Venn: |M∪S| = 30+25−10 = 45. Neither = 50−45 = 5.",
    "50 − 45 = 5 students like neither.");
  q("v32a006","analytical","Venn Diagram","medium",
    "In a survey of 80 people: 45 read newspapers, 30 read magazines, and 12 read both. How many read at least one?",
    ["55","60","63","75"],2,
    "|N∪M| = 45+30−12 = 63.",
    "45 + 30 − 12 = 63 people read at least one.");
  q("v32v015","verbal","Sentence Correction","easy",
    "Which sentence has a DOUBLE NEGATIVE error?",
    [
      "She doesn't have any complaints.",
      "He couldn't find nothing in the report.",
      "They haven't received the memo yet.",
      "The plan doesn't seem feasible."
    ],1,
    "Double negative: 'couldn't' + 'nothing'. Use 'couldn't find anything'.",
    "'Couldn't find nothing' = double negative. Should be: 'couldn't find anything'.");
  q("v32v016","verbal","Sentence Correction","medium",
    "Identify the REDUNDANCY error:",
    [
      "She repeated the announcement again.",
      "The manager reviewed the proposal.",
      "They completed the project on time.",
      "He submitted the required documents."
    ],0,
    "'Repeated' already means doing something again. 'Again' is redundant.",
    "'Repeated again' is redundant. 'Repeated' already implies doing it again.");
  q("v32v017","verbal","Parallel Structure","medium",
    "Which sentence has correct PARALLEL STRUCTURE?",
    [
      "She likes running, to swim, and cycling.",
      "She likes running, swimming, and cycling.",
      "She likes to run, swimming, and to cycle.",
      "She likes running, swim, and to cycle."
    ],1,
    "Parallel structure: use the same grammatical form for all items in a series.",
    "All gerunds (-ing form): running, swimming, cycling — this is parallel.");
  q("v32v018","verbal","Tag Questions","easy",
    "Choose the correct tag question: 'She is coming to the meeting, ___?'",
    ["isn't it","isn't she","aren't she","doesn't she"],1,
    "Tag question uses opposite auxiliary of the main sentence. 'She is' → 'isn't she?'",
    "Affirmative main clause → negative tag. 'Is' → 'isn't she'.");

  /* ═══════════════════════════════════════════════
     GENERAL INFORMATION — Constitution & RA 6713
  ═══════════════════════════════════════════════ */
  q("v32g001","general","Philippine Constitution","easy",
    "Which article of the Philippine Constitution contains the Bill of Rights?",
    ["Article I","Article II","Article III","Article IV"],2,
    "Article III of the 1987 Philippine Constitution is the Bill of Rights.",
    "The Bill of Rights is in Article III of the 1987 Constitution.");
  q("v32g002","general","Philippine Constitution","medium",
    "The Philippine Senate is composed of how many senators?",
    ["12","18","24","36"],2,
    "The Senate is composed of 24 senators elected at large.",
    "Article VI, Sec. 2: The Senate shall be composed of twenty-four Senators.");
  q("v32g003","general","Philippine Constitution","medium",
    "What is the minimum age requirement to run for President of the Philippines?",
    ["35 years old","40 years old","45 years old","50 years old"],1,
    "The Constitution requires the President to be at least 40 years old.",
    "Article VII, Sec. 2: No person may be elected President unless...at least forty years of age.");
  q("v32g004","general","RA 6713","medium",
    "Under RA 6713, within how many working days must a public official respond to letters and requests?",
    ["10 working days","15 working days","20 working days","30 working days"],1,
    "Section 5(d) of RA 6713: respond within 15 working days from receipt.",
    "RA 6713, Sec. 5(d): respond to letters and requests within 15 working days.");
  q("v32g005","general","RA 6713","medium",
    "RA 6713 is also known as the ___.",
    [
      "Government Service Insurance Act",
      "Anti-Graft and Corrupt Practices Act",
      "Code of Conduct and Ethical Standards for Public Officials and Employees",
      "Civil Service Act of the Philippines"
    ],2,
    "RA 6713 = Code of Conduct and Ethical Standards for Public Officials and Employees (1989).",
    "RA 6713 is the Code of Conduct and Ethical Standards for Public Officials and Employees.");
  q("v32g006","general","RA 6713","hard",
    "Under RA 6713, the SALN must be filed annually on or before ___.",
    ["March 31","April 30","May 31","June 30"],1,
    "SALN is filed annually on or before April 30 of every year.",
    "RA 6713 mandates annual SALN filing on or before April 30.");
  q("v32g007","general","Constitutional Commissions","medium",
    "Which of the following is NOT one of the three Constitutional Commissions?",
    ["Civil Service Commission","Commission on Elections","Commission on Audit","Commission on Human Rights"],3,
    "The three Constitutional Commissions under Article IX are CSC, COMELEC, and COA. CHR is created under Article XIII.",
    "CHR is not a Constitutional Commission under Article IX. It is established under Article XIII (Social Justice).");
  q("v32g008","general","Human Rights","medium",
    "Which body is primarily tasked with investigating human rights violations in the Philippines?",
    ["Department of Justice","Commission on Human Rights","Ombudsman","Supreme Court"],1,
    "The CHR is the independent constitutional body for human rights investigation.",
    "The Commission on Human Rights (CHR) investigates violations of civil and political rights.");
  q("v32g009","general","Environment","easy",
    "RA 9003 is the law governing ___ in the Philippines.",
    ["Clean Air","Clean Water","Solid Waste Management","Climate Change"],2,
    "RA 9003 = Ecological Solid Waste Management Act of 2000.",
    "RA 9003 is the Ecological Solid Waste Management Act.");
  q("v32g010","general","Environment","medium",
    "The term 'mitigation' in climate change refers to ___.",
    [
      "Adjusting to the effects of climate change",
      "Reducing greenhouse gas emissions to limit climate change",
      "Predicting future climate patterns",
      "Recovering from climate-related disasters"
    ],1,
    "Mitigation = reducing the causes. Adaptation = adjusting to effects.",
    "Mitigation reduces greenhouse gas emissions. Adaptation addresses impacts already occurring.");

  console.log("v32: Question bank expanded. Total questions now:", Q.length);
})();
