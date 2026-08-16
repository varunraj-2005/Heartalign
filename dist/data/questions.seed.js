"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_QUESTIONS = void 0;
exports.SEED_QUESTIONS = [
    // ==========================================
    // 1. VALUES & LIFE GOALS (25% Weight)
    // ==========================================
    {
        id: 'val_1',
        category: 'Values & Life Goals',
        question_type: 'multiple_choice_match',
        prompt: 'Where do you picture your ideal home environment in 5–10 years?',
        subtitle: 'Select the lifestyle location that feels most like home to you.',
        options: [
            { value: 'city', label: 'Bustling City Center', description: 'Vibrant urban energy close to dining and culture.' },
            { value: 'suburbs', label: 'Peaceful Suburbs', description: 'Spacious home with a yard and quiet neighborhood.' },
            { value: 'rural', label: 'Country / Rural Sanctuary', description: 'Fresh air, nature, and peaceful distance.' },
            { value: 'nomadic', label: 'Nomadic / Frequent Travel', description: 'Flexibility to move around and explore new cities.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                city: { city: 100, suburbs: 65, rural: 30, nomadic: 75 },
                suburbs: { city: 65, suburbs: 100, rural: 70, nomadic: 35 },
                rural: { city: 30, suburbs: 70, rural: 100, nomadic: 40 },
                nomadic: { city: 75, suburbs: 35, rural: 40, nomadic: 100 }
            }
        }
    },
    {
        id: 'val_2',
        category: 'Values & Life Goals',
        question_type: 'scale_1_to_5',
        prompt: 'How do you balance career ambition versus personal / family lifestyle?',
        subtitle: '1 = Career & achievement first | 5 = Family & lifestyle quality first',
        options: [
            { value: 1, label: '1 - Career-focused' },
            { value: 2, label: '2 - Leaning Career' },
            { value: 3, label: '3 - Equal Balance' },
            { value: 4, label: '4 - Leaning Lifestyle' },
            { value: 5, label: '5 - Family & Lifestyle-focused' }
        ]
    },
    {
        id: 'val_3',
        category: 'Values & Life Goals',
        question_type: 'scale_1_to_5',
        prompt: 'What is your primary mindset around financial budgeting and spending?',
        subtitle: '1 = Strict saver, security first | 5 = Enjoy life now, spend for experiences',
        options: [
            { value: 1, label: '1 - Strict Saver' },
            { value: 2, label: '2 - Cautious Planner' },
            { value: 3, label: '3 - Balanced Budgeter' },
            { value: 4, label: '4 - Experience Seeker' },
            { value: 5, label: '5 - Spontaneous Spender' }
        ]
    },
    {
        id: 'val_4',
        category: 'Values & Life Goals',
        question_type: 'multiple_choice_match',
        prompt: 'What is your perspective on having children / growing a family?',
        subtitle: 'Select your current stance.',
        options: [
            { value: 'want_kids', label: 'Definitely Want Children', description: 'Excited to raise children together.' },
            { value: 'open_kids', label: 'Open to Children', description: 'Happy either way depending on circumstances.' },
            { value: 'no_kids', label: 'Child-Free Lifestyle', description: 'Prefer a life focused on partnership and personal goals.' },
            { value: 'unsure', label: 'Undecided / Still Exploring', description: 'Taking time to reflect before deciding.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                want_kids: { want_kids: 100, open_kids: 75, no_kids: 0, unsure: 50 },
                open_kids: { want_kids: 75, open_kids: 100, no_kids: 60, unsure: 75 },
                no_kids: { want_kids: 0, open_kids: 60, no_kids: 100, unsure: 50 },
                unsure: { want_kids: 50, open_kids: 75, no_kids: 50, unsure: 100 }
            }
        }
    },
    // ==========================================
    // 2. TRUST & COMMUNICATION (25% Weight)
    // ==========================================
    {
        id: 'tru_1',
        category: 'Trust & Communication',
        question_type: 'scale_1_to_5',
        prompt: 'How easily do you share vulnerable feelings when you are feeling hurt or insecure?',
        subtitle: '1 = Keep inside until processed | 5 = Share openly and right away',
        options: [
            { value: 1, label: '1 - Very Private / Internalizer' },
            { value: 2, label: '2 - Cautious Sharer' },
            { value: 3, label: '3 - Moderately Open' },
            { value: 4, label: '4 - Expressive & Open' },
            { value: 5, label: '5 - Completely Transparent' }
        ]
    },
    {
        id: 'tru_2',
        category: 'Trust & Communication',
        question_type: 'scale_1_to_5',
        prompt: 'What is your preference for financial transparency in a committed relationship?',
        subtitle: '1 = Separate accounts & individual control | 5 = Fully combined joint finances',
        options: [
            { value: 1, label: '1 - Fully Separate Accounts' },
            { value: 2, label: '2 - Separate with shared expense pool' },
            { value: 3, label: '3 - 50/50 Hybrid approach' },
            { value: 4, label: '4 - Mostly Joint with small personal stash' },
            { value: 5, label: '5 - Completely Merged Finances' }
        ]
    },
    {
        id: 'tru_3',
        category: 'Trust & Communication',
        question_type: 'multiple_choice_match',
        prompt: 'When you feel misunderstood by your partner, how do you usually respond?',
        subtitle: 'Choose your default reaction.',
        options: [
            { value: 'clarify_immediately', label: 'Re-explain calmly right away', description: 'Try to reframe immediately so we get on the same page.' },
            { value: 'take_pause', label: 'Pause and gather my thoughts', description: 'Step back for a moment so emotions stay balanced.' },
            { value: 'ask_questions', label: 'Ask partner to explain their perspective', description: 'Focus on hearing their view first.' },
            { value: 'withdraw_temp', label: 'Quiet down until mood clears', description: 'Withdraw temporarily to prevent friction.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                clarify_immediately: { clarify_immediately: 100, take_pause: 80, ask_questions: 90, withdraw_temp: 50 },
                take_pause: { clarify_immediately: 80, take_pause: 100, ask_questions: 85, withdraw_temp: 70 },
                ask_questions: { clarify_immediately: 90, take_pause: 85, ask_questions: 100, withdraw_temp: 60 },
                withdraw_temp: { clarify_immediately: 50, take_pause: 70, ask_questions: 60, withdraw_temp: 100 }
            }
        }
    },
    {
        id: 'tru_4',
        category: 'Trust & Communication',
        question_type: 'scale_1_to_5',
        prompt: 'How important is daily check-in communication when you are physically apart?',
        subtitle: '1 = Light updates as needed | 5 = Constant text updates & calls throughout the day',
        options: [
            { value: 1, label: '1 - Low touch / Independence first' },
            { value: 2, label: '2 - Occasional text updates' },
            { value: 3, label: '3 - Morning & evening check-in' },
            { value: 4, label: '4 - Regular active messages' },
            { value: 5, label: '5 - Constant touchpoints' }
        ]
    },
    // ==========================================
    // 3. CONFLICT STYLE (15% Weight)
    // ==========================================
    {
        id: 'cnf_1',
        category: 'Conflict Style',
        question_type: 'multiple_choice_match',
        prompt: 'When a disagreement gets intense, what is your immediate instinct?',
        subtitle: 'Identify how you process conflict in the heat of the moment.',
        options: [
            { value: 'cool_off', label: 'Cool-Off Seeker', description: 'I need 20–30 minutes alone to calm down before talking.' },
            { value: 'resolve_now', label: 'Immediate Resolver', description: 'I want to talk through it immediately; sleeping on it causes anxiety.' },
            { value: 'written_notes', label: 'Thoughtful Writer', description: 'I prefer organizing my thoughts in writing or structured points.' },
            { value: 'harmony_first', label: 'Harmony Preserver', description: 'I look to de-escalate with humor or compromise quickly.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                cool_off: { cool_off: 100, resolve_now: 70, written_notes: 85, harmony_first: 75 },
                resolve_now: { cool_off: 70, resolve_now: 100, written_notes: 75, harmony_first: 80 },
                written_notes: { cool_off: 85, resolve_now: 75, written_notes: 100, harmony_first: 85 },
                harmony_first: { cool_off: 75, resolve_now: 80, written_notes: 85, harmony_first: 100 }
            },
            complementary_conflict_pairs: [
                {
                    val1: 'cool_off',
                    val2: 'resolve_now',
                    flag_name: 'Space Seeker vs. Immediate Processor',
                    description: 'One partner needs a cool-down pause while the other seeks immediate resolution. This is a very common complementary dynamic! Agreement on a return timestamp (e.g. "let us reconnect in 30 mins") prevents anxiety.'
                },
                {
                    val1: 'written_notes',
                    val2: 'resolve_now',
                    flag_name: 'Structured Writer vs. Verbal Processor',
                    description: 'One partner processes thoughts verbally in real time while the other prefers structured reflection. Allowing time to write or organize thoughts yields much smoother conversations.'
                }
            ]
        }
    },
    {
        id: 'cnf_2',
        category: 'Conflict Style',
        question_type: 'scale_1_to_5',
        prompt: 'How flexible are you when finding a compromise during arguments?',
        subtitle: '1 = Hold firm on core principles | 5 = Eager to adapt to partner preference',
        options: [
            { value: 1, label: '1 - Firm Principle Stand' },
            { value: 2, label: '2 - Cautious Negotiator' },
            { value: 3, label: '3 - Balanced Win-Win' },
            { value: 4, label: '4 - Highly Adaptable' },
            { value: 5, label: '5 - Peace & Harmony First' }
        ]
    },
    {
        id: 'cnf_3',
        category: 'Conflict Style',
        question_type: 'multiple_choice_match',
        prompt: 'What makes an apology feel genuine and meaningful to you?',
        subtitle: 'Select what restores trust after a mistake.',
        options: [
            { value: 'words_acknowledgment', label: 'Clear Verbal Responsibility', description: '"I was wrong and I understand how it affected you."' },
            { value: 'changed_behavior', label: 'Changed Action Over Time', description: 'Don’t just say sorry; show changed behavior.' },
            { value: 'reparations', label: 'Making It Right / Amends', description: 'Offering a solution or restorative action.' },
            { value: 'warmth_embrace', label: 'Affection & Emotional Reconnection', description: 'A warm hug and reaffirmation of love.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                words_acknowledgment: { words_acknowledgment: 100, changed_behavior: 80, reparations: 75, warmth_embrace: 70 },
                changed_behavior: { words_acknowledgment: 80, changed_behavior: 100, reparations: 85, warmth_embrace: 65 },
                reparations: { words_acknowledgment: 75, changed_behavior: 85, reparations: 100, warmth_embrace: 75 },
                warmth_embrace: { words_acknowledgment: 70, changed_behavior: 65, reparations: 75, warmth_embrace: 100 }
            }
        }
    },
    {
        id: 'cnf_4',
        category: 'Conflict Style',
        question_type: 'open_ended_reflection',
        prompt: 'What is one specific reassurance your partner can give you that helps lower your guard during a disagreement?',
        subtitle: 'This will be displayed side-by-side for mutual reflection (not scored).'
    },
    // ==========================================
    // 4. INTIMACY & AFFECTION (15% Weight)
    // ==========================================
    {
        id: 'int_1',
        category: 'Intimacy & Affection',
        question_type: 'multiple_choice_match',
        prompt: 'Which primary Love Language makes you feel most cherished?',
        subtitle: 'Select the gesture that resonates deepest.',
        options: [
            { value: 'words', label: 'Words of Affirmation', description: 'Encouraging notes, compliments, and sincere verbal love.' },
            { value: 'touch', label: 'Physical Touch', description: 'Holding hands, hugs, back rubs, and physical closeness.' },
            { value: 'time', label: 'Quality Time', description: 'Undivided attention, shared adventures, and deep chats.' },
            { value: 'service', label: 'Acts of Service', description: 'Helpful gestures, taking tasks off your plate, thoughtful actions.' },
            { value: 'gifts', label: 'Thoughtful Gifts', description: 'Meaningful tokens showing you were remembered.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                words: { words: 100, touch: 75, time: 80, service: 70, gifts: 65 },
                touch: { words: 75, touch: 100, time: 85, service: 65, gifts: 60 },
                time: { words: 80, touch: 85, time: 100, service: 80, gifts: 70 },
                service: { words: 70, touch: 65, time: 80, service: 100, gifts: 75 },
                gifts: { words: 65, touch: 60, time: 70, service: 75, gifts: 100 }
            }
        }
    },
    {
        id: 'int_2',
        category: 'Intimacy & Affection',
        question_type: 'scale_1_to_5',
        prompt: 'How frequently do you crave spontaneous physical affection in daily life?',
        subtitle: '1 = Low need / subtle gestures | 5 = Constant hugs, hand-holding, and touch',
        options: [
            { value: 1, label: '1 - Low Touch / Reserved' },
            { value: 2, label: '2 - Occasional Warm Touch' },
            { value: 3, label: '3 - Moderate Daily Touch' },
            { value: 4, label: '4 - High Daily Touch' },
            { value: 5, label: '5 - Constant Affection' }
        ]
    },
    {
        id: 'int_3',
        category: 'Intimacy & Affection',
        question_type: 'scale_1_to_5',
        prompt: 'How often do you need explicit verbal reassurance of your partner\'s feelings?',
        subtitle: '1 = Actions speak louder, rare words needed | 5 = Daily verbal expressions essential',
        options: [
            { value: 1, label: '1 - Actions speak; rare words needed' },
            { value: 2, label: '2 - Weekly affirmations' },
            { value: 3, label: '3 - Balanced regular verbal love' },
            { value: 4, label: '4 - Daily verbal encouragement' },
            { value: 5, label: '5 - Frequent daily reassurance essential' }
        ]
    },
    {
        id: 'int_4',
        category: 'Intimacy & Affection',
        question_type: 'open_ended_reflection',
        prompt: 'Describe a small, unexpected date idea or romantic gesture that would make your week.',
        subtitle: 'Displayed side-by-side in your results report for discussion.'
    },
    // ==========================================
    // 5. DAILY LIFE & HABITS (10% Weight)
    // ==========================================
    {
        id: 'hab_1',
        category: 'Daily Life & Habits',
        question_type: 'multiple_choice_match',
        prompt: 'What is your preferred approach to household chores and daily responsibilities?',
        subtitle: 'Select your natural organizational style.',
        options: [
            { value: 'strict_split', label: 'Explicit Division of Tasks', description: 'Clear ownership of specific duties (e.g. cooking vs laundry).' },
            { value: 'spontaneous_help', label: 'See & Do / Flow state', description: 'Pitch in whenever something needs cleaning without strict schedules.' },
            { value: 'together_blitz', label: 'Clean Together Blitzes', description: 'Set aside weekend sessions to tackle everything as a team.' },
            { value: 'outsource', label: 'Outsource / Automate', description: 'Use robot vacuums, meal delivery, or external help where possible.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                strict_split: { strict_split: 100, spontaneous_help: 60, together_blitz: 80, outsource: 75 },
                spontaneous_help: { strict_split: 60, spontaneous_help: 100, together_blitz: 85, outsource: 70 },
                together_blitz: { strict_split: 80, spontaneous_help: 85, together_blitz: 100, outsource: 80 },
                outsource: { strict_split: 75, spontaneous_help: 70, together_blitz: 80, outsource: 100 }
            }
        }
    },
    {
        id: 'hab_2',
        category: 'Daily Life & Habits',
        question_type: 'scale_1_to_5',
        prompt: 'How do you like spending your typical weekend free time?',
        subtitle: '1 = Relaxing homebody with book/movies | 5 = Outdoors, events, and active social calendar',
        options: [
            { value: 1, label: '1 - Total Homebody / Cozy Quiet' },
            { value: 2, label: '2 - Mostly Relaxed Home' },
            { value: 3, label: '3 - Mix of Social & Downtime' },
            { value: 4, label: '4 - Active Outings & Socializing' },
            { value: 5, label: '5 - Non-stop Adventure & Events' }
        ]
    },
    {
        id: 'hab_3',
        category: 'Daily Life & Habits',
        question_type: 'multiple_choice_match',
        prompt: 'What is your sleep rhythm and morning energy level?',
        subtitle: 'Select your bio-clock rhythm.',
        options: [
            { value: 'early_bird', label: 'Early Bird', description: 'Up at dawn full of energy; early to bed.' },
            { value: 'night_owl', label: 'Night Owl', description: 'Peak creative energy late at night; prefer sleeping in.' },
            { value: 'flexible_sleeper', label: 'Flexible / Standard', description: 'Adaptable sleep pattern based on schedule.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                early_bird: { early_bird: 100, night_owl: 40, flexible_sleeper: 80 },
                night_owl: { early_bird: 40, night_owl: 100, flexible_sleeper: 80 },
                flexible_sleeper: { early_bird: 80, night_owl: 80, flexible_sleeper: 100 }
            }
        }
    },
    // ==========================================
    // 6. FUN / TRIVIA (10% Weight)
    // ==========================================
    {
        id: 'fun_1',
        category: 'Fun/Trivia',
        question_type: 'multiple_choice_match',
        prompt: 'What is your absolute ultimate comfort food night vibe?',
        subtitle: 'Pick the meal experience that brings maximum joy.',
        options: [
            { value: 'pizza_movie', label: 'Pizza & Movie Night', description: 'Classic cheesy pizza and cozy couch film.' },
            { value: 'sushi_wine', label: 'Fresh Sushi & Crisp Drinks', description: 'Sophisticated rolls and relaxed music.' },
            { value: 'taco_fiesta', label: 'Taco & Mexican Feast', description: 'Flavorful tacos, guac, and vibrant energy.' },
            { value: 'home_cooked', label: 'Hearty Home-Cooked Stew / Pasta', description: 'Warm comforting home recipe cooked together.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                pizza_movie: { pizza_movie: 100, sushi_wine: 75, taco_fiesta: 85, home_cooked: 80 },
                sushi_wine: { pizza_movie: 75, sushi_wine: 100, taco_fiesta: 70, home_cooked: 75 },
                taco_fiesta: { pizza_movie: 85, sushi_wine: 70, taco_fiesta: 100, home_cooked: 80 },
                home_cooked: { pizza_movie: 80, sushi_wine: 75, taco_fiesta: 80, home_cooked: 100 }
            }
        }
    },
    {
        id: 'fun_2',
        category: 'Fun/Trivia',
        question_type: 'multiple_choice_match',
        prompt: 'If you had a completely free 7-day vacation, where would you fly?',
        subtitle: 'Select your dream getaway style.',
        options: [
            { value: 'tropical_beach', label: 'Tropical Beach Resort', description: 'Sun, ocean waves, cocktails, and total relaxation.' },
            { value: 'european_culture', label: 'European Historic City', description: 'Museums, cobblestone streets, cafes, and architecture.' },
            { value: 'mountain_hiking', label: 'Mountain Cabin & Hiking', description: 'Trail trekking, crisp air, campfire stargazing.' },
            { value: 'theme_park', label: 'High-Energy Theme Park / Thrill', description: 'Roller coasters, immersive attractions, and non-stop fun.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                tropical_beach: { tropical_beach: 100, european_culture: 75, mountain_hiking: 65, theme_park: 60 },
                european_culture: { tropical_beach: 75, european_culture: 100, mountain_hiking: 80, theme_park: 65 },
                mountain_hiking: { tropical_beach: 65, european_culture: 80, mountain_hiking: 100, theme_park: 55 },
                theme_park: { tropical_beach: 60, european_culture: 65, mountain_hiking: 55, theme_park: 100 }
            }
        }
    },
    {
        id: 'fun_3',
        category: 'Fun/Trivia',
        question_type: 'multiple_choice_match',
        prompt: 'What would be your dream joint hobby or activity to pick up together?',
        subtitle: 'Choose a skill to learn together.',
        options: [
            { value: 'cooking_baking', label: 'Gourmet Cooking / Baking Class', description: 'Mastering artisan recipes and wine pairings.' },
            { value: 'dance_fitness', label: 'Salsa / Partner Dancing', description: 'Rhythm, coordination, and fun exercise.' },
            { value: 'gardening_diy', label: 'Gardening & Home DIY Projects', description: 'Creating beautiful spaces and growing plants.' },
            { value: 'gaming_puzzles', label: 'Co-op Video Games & Board Games', description: 'Strategic challenges and playful competition.' }
        ],
        scoring_rules: {
            exact_match_score: 100,
            partial_matrix: {
                cooking_baking: { cooking_baking: 100, dance_fitness: 75, gardening_diy: 85, gaming_puzzles: 70 },
                dance_fitness: { cooking_baking: 75, dance_fitness: 100, gardening_diy: 65, gaming_puzzles: 60 },
                gardening_diy: { cooking_baking: 85, dance_fitness: 65, gardening_diy: 100, gaming_puzzles: 75 },
                gaming_puzzles: { cooking_baking: 70, dance_fitness: 60, gardening_diy: 75, gaming_puzzles: 100 }
            }
        }
    }
];
