import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing database
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.battle.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Badges
  const badges = [
    { name: 'First Submission', description: 'Submit your very first weekend battle project!', icon: 'Award', xpReward: 100 },
    { name: 'Weekend Builder', description: 'Successfully complete your first challenge.', icon: 'Calendar', xpReward: 200 },
    { name: 'Champion', description: 'Earn 1st place in any weekend battle.', icon: 'Trophy', xpReward: 500 },
    { name: 'Top 10 Finisher', description: 'Place in the top 10 in a weekend battle.', icon: 'Star', xpReward: 300 },
    { name: '5 Week Streak', description: 'Participate in weekend battles 5 weeks in a row.', icon: 'Flame', xpReward: 400 },
    { name: '10 Week Streak', description: 'Participate in weekend battles 10 weeks in a row.', icon: 'Zap', xpReward: 800 },
    { name: 'Challenge Veteran', description: 'Participate in 10 battles overall.', icon: 'Shield', xpReward: 600 }
  ];

  const createdBadges: any[] = [];
  for (const b of badges) {
    const badge = await prisma.badge.create({ data: b });
    createdBadges.push(badge);
  }
  console.log(`Seeded ${createdBadges.length} badges.`);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillbattle.com',
      username: 'admin',
      fullName: 'SkillBattle Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: 'Platform founder and challenges architect.',
      skills: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'UI/UX']),
      role: 'admin',
      xp: 2500,
      currentStreak: 12,
      maxStreak: 12,
      githubUrl: 'https://github.com/skillbattle',
      portfolioUrl: 'https://skillbattle.com'
    }
  });

  const builders = [
    {
      email: 'alex@skillbattle.com',
      username: 'alex_dev',
      fullName: 'Alex Rivers',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Full stack developer building in public. React and Tailwind enthusiast.',
      skills: JSON.stringify(['React', 'TypeScript', 'Tailwind', 'Node.js']),
      role: 'user',
      xp: 1550,
      currentStreak: 5,
      maxStreak: 8,
      githubUrl: 'https://github.com/alex_dev',
      linkedinUrl: 'https://linkedin.com/in/alex-dev'
    },
    {
      email: 'sarah@skillbattle.com',
      username: 'sarah_m',
      fullName: 'Sarah Miller',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Product designer crossing over to frontend. Love micro-interactions.',
      skills: JSON.stringify(['UI/UX', 'Figma', 'React', 'CSS Art']),
      role: 'user',
      xp: 1100,
      currentStreak: 3,
      maxStreak: 3,
      githubUrl: 'https://github.com/sarah_m',
      linkedinUrl: 'https://linkedin.com/in/sarah-miller'
    },
    {
      email: 'elena@skillbattle.com',
      username: 'elena_codes',
      fullName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      bio: 'Software engineer. I build speedy web applications and AI wrappers.',
      skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Python', 'AI']),
      role: 'user',
      xp: 2200,
      currentStreak: 8,
      maxStreak: 8,
      githubUrl: 'https://github.com/elena_codes',
      portfolioUrl: 'https://elena.dev'
    },
    {
      email: 'marcus@skillbattle.com',
      username: 'marcus_ux',
      fullName: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      bio: 'Designer learning code. Here to build fast and break designs.',
      skills: JSON.stringify(['UI/UX', 'HTML', 'Tailwind CSS', 'Figma']),
      role: 'user',
      xp: 600,
      currentStreak: 1,
      maxStreak: 4,
      githubUrl: 'https://github.com/marcus_ux'
    }
  ];

  const createdBuilders: any[] = [];
  for (const b of builders) {
    const user = await prisma.user.create({ data: b });
    createdBuilders.push(user);

    // Award initial badges
    const firstSubBadge = createdBadges.find(bg => bg.name === 'First Submission')!;
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: firstSubBadge.id
      }
    });

    if (user.xp >= 1000) {
      const wkBuilderBadge = createdBadges.find(bg => bg.name === 'Weekend Builder')!;
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: wkBuilderBadge.id
        }
      });
    }

    if (user.username === 'elena_codes') {
      const championBadge = createdBadges.find(bg => bg.name === 'Champion')!;
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: championBadge.id
        }
      });
    }
  }
  console.log(`Seeded ${createdBuilders.length} builders.`);

  // 4. Create Battles
  const now = new Date();

  // Completed Battle: 2 weeks ago
  const completedBattle = await prisma.battle.create({
    data: {
      title: 'E-Commerce Micro-Interactions',
      tagline: 'Design and build interactive checkout flows that convert.',
      description: 'The objective of this challenge is to build a premium e-commerce add-to-cart and checkout flow. Focus heavily on responsive animations, sleek hover states, card validation checks, and checkout success animations. Make it feel premium, professional, and satisfying to buy.',
      rules: '1. Build only using React or Vanilla JS. 2. Must run fully in the browser. 3. Code must be original.',
      requirements: '- Satisfying add-to-cart animation\n- Visual cart summary dropdown or drawer\n- Interactive checkout form with input masking\n- Animated success screen',
      guidelines: 'Use Framer Motion or native CSS transitions for buttery smooth animations. Use vibrant success states (#22C55E).',
      registrationStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 60 mins
      status: 'completed'
    }
  });

  // Seed registrations, submissions and votes for completed battle
  for (const builder of createdBuilders) {
    await prisma.registration.create({
      data: {
        userId: builder.id,
        battleId: completedBattle.id
      }
    });

    // Submissions
    if (builder.username !== 'marcus_ux') {
      const sub = await prisma.submission.create({
        data: {
          userId: builder.id,
          battleId: completedBattle.id,
          githubUrl: `https://github.com/${builder.username}/checkout-flow-challenge`,
          liveUrl: `https://${builder.username}-checkout.vercel.app`,
          description: `Super smooth micro-interactions challenge submission! Built with Framer Motion, Tailwind, and React. Verified with screen reader compatibility and keyboard nav.`
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: builder.id,
          type: 'submit',
          content: `Submitted checkout-flow-challenge project for "${completedBattle.title}"`
        }
      });
    }
  }

  // Voting Battle: Ends today, voting starts now
  const votingBattle = await prisma.battle.create({
    data: {
      title: 'AI Prompt Engineering UI Playground',
      tagline: 'Create a rich user interface to test, save, and evaluate AI prompts.',
      description: 'Builders are challenged to design a dashboard that lets users write prompts, view tokens, configure variables (temperature, top_p), and inspect side-by-side completions. Since it is frontend-focused, you can mock the actual API completions, but the developer options must feel highly interactive.',
      rules: '1. Submission requires GitHub and live link. 2. Must support variable insertion (e.g. {{variable}}). 3. CSS/styling must match our modern SaaS color standards.',
      requirements: '- Variables editor sidebar\n- Side-by-side prompt output comparisons\n- Token count estimator\n- Beautiful cards and export/copy functions',
      guidelines: 'Design matching the modern gray/dark theme. Add micro-animations for sliding panels.',
      registrationStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: 'voting'
    }
  });

  // Seed submissions for voting battle
  const subs = [];
  for (const builder of createdBuilders) {
    // Everyone registered
    await prisma.registration.create({
      data: {
        userId: builder.id,
        battleId: votingBattle.id
      }
    });

    // Everyone submitted except alex_dev
    if (builder.username !== 'alex_dev') {
      const sub = await prisma.submission.create({
        data: {
          userId: builder.id,
          battleId: votingBattle.id,
          githubUrl: `https://github.com/${builder.username}/ai-prompt-playground`,
          liveUrl: `https://${builder.username}-prompts.vercel.app`,
          description: `Interactive playground. Fully supports dynamic regex-based variable substitution, prompt locking, dark theme templates, and mock GPT outputs with stream simulations.`
        }
      });
      subs.push(sub);

      await prisma.activityLog.create({
        data: {
          userId: builder.id,
          type: 'submit',
          content: `Submitted AI prompt engineering playground for "${votingBattle.title}"`
        }
      });
    }
  }

  // Seed votes for voting battle (anonymous)
  // elena_codes gets 3 votes, sarah_m gets 2, marcus_ux gets 1
  const subElena = subs.find(s => s.userId === createdBuilders.find(u => u.username === 'elena_codes')!.id)!;
  const subSarah = subs.find(s => s.userId === createdBuilders.find(u => u.username === 'sarah_m')!.id)!;
  const subMarcus = subs.find(s => s.userId === createdBuilders.find(u => u.username === 'marcus_ux')!.id)!;

  // Voters: Admin, Alex
  await prisma.vote.create({ data: { voterId: admin.id, submissionId: subElena.id, battleId: votingBattle.id } });
  await prisma.vote.create({ data: { voterId: admin.id, submissionId: subSarah.id, battleId: votingBattle.id } });
  
  const alexUser = createdBuilders.find(u => u.username === 'alex_dev')!;
  await prisma.vote.create({ data: { voterId: alexUser.id, submissionId: subElena.id, battleId: votingBattle.id } });
  await prisma.vote.create({ data: { voterId: alexUser.id, submissionId: subMarcus.id, battleId: votingBattle.id } });

  const marcusUser = createdBuilders.find(u => u.username === 'marcus_ux')!;
  await prisma.vote.create({ data: { voterId: marcusUser.id, submissionId: subElena.id, battleId: votingBattle.id } });
  
  const sarahUser = createdBuilders.find(u => u.username === 'sarah_m')!;
  await prisma.vote.create({ data: { voterId: sarahUser.id, submissionId: subSarah.id, battleId: votingBattle.id } });


  // Active Battle: Live now! (60 mins long)
  // We place start time 20 mins ago, end time 40 mins from now.
  const activeBattle = await prisma.battle.create({
    data: {
      title: 'Sleek Pomodoro Dashboard',
      tagline: 'Code a distraction-free Pomodoro workspace with widgets.',
      description: '# The Challenge: Pomodoro Builder Workspace\n\nYour task is to build a gorgeous, minimalist Pomodoro web app designed for software builders. \n\n### Core Tasks:\n1. **Timer Engine**: Focus (25m), Short Break (5m), Long Break (15m) with clean sound alerts (or visual flashes).\n2. **Session Logger**: Track completed sessions visually (e.g. small lights or filled squares).\n3. **Quick Todo List**: Integrated inline list to write down active task items during the timer.\n4. **Ambiance widgets**: Audio ambient noise slider (White noise, Rain, Cafe) using dummy loops or simple oscillators.\n\n### Rules:\n- No external frameworks other than React and standard styling libraries.\n- Keep it highly keyboard-accessible (Space to start/stop timer).\n- Must submit links before the timer runs out!',
      rules: '1. Submission portal closes instantly when timer hits zero. 2. Must include both Github repo and working url. 3. Code must not be copy-pasted from existing templates.',
      requirements: '- Standard Pomodoro cycle configuration\n- Sound/visual alerts for session transitions\n- Dynamic title bar updates (e.g., "🍅 24:59 - Focus")\n- Keyboard short-cuts (Space key)',
      guidelines: 'Think Notion/Linear styling. Use beautiful typography (Outfit or Inter). Accent colors should feel rich (Tomato Orange/Success Green).',
      registrationStart: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() - 10 * 60 * 1000), // ended 10 mins ago
      startTime: new Date(now.getTime() - 20 * 60 * 1000), // started 20 mins ago
      endTime: new Date(now.getTime() + 40 * 60 * 1000), // ends in 40 mins
      status: 'active'
    }
  });

  // Register some builders for this live battle
  for (const builder of createdBuilders) {
    if (builder.username !== 'marcus_ux') {
      await prisma.registration.create({
        data: {
          userId: builder.id,
          battleId: activeBattle.id
        }
      });
    }
  }


  // Preparation Battle: Registration closed, battle starts tomorrow
  const preparationBattle = await prisma.battle.create({
    data: {
      title: 'Markdown Portfolio Generator',
      tagline: 'Convert markdown text files into sleek developer profiles.',
      description: '[Hidden Prompt] In this battle you will create a markdown editor that parses layout blocks and renders them into custom styles. (Revealed when battle begins)',
      rules: '1. Registration has closed. 2. Prepare your tools and packages on Friday. 3. The challenge prompt will unlock tomorrow.',
      requirements: '- Live HTML preview pane\n- Multiple pre-designed themes (Glass, Cyber, Modernist)\n- Single-click static HTML output download\n- LocalStorage draft saving',
      guidelines: 'Familiarize yourself with markdown parsers like `marked` or compile native regex parsers. Make sure your renderer is sandboxed.',
      registrationStart: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() - 4 * 60 * 1000), // closed
      startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: 'preparation'
    }
  });

  // Register some builders for preparation battle
  await prisma.registration.create({ data: { userId: createdBuilders[0].id, battleId: preparationBattle.id } });
  await prisma.registration.create({ data: { userId: createdBuilders[1].id, battleId: preparationBattle.id } });
  await prisma.registration.create({ data: { userId: createdBuilders[2].id, battleId: preparationBattle.id } });


  // Upcoming Battle: Register now!
  const upcomingBattle = await prisma.battle.create({
    data: {
      title: 'Vibrant Retro Platformer Landing Page',
      tagline: 'Create a game marketing page with dynamic parallax and gameplay mockups.',
      description: 'Details will reveal on Saturday evening. Prepare for high fidelity layout design and interactive animations.',
      rules: '1. Registration is currently open. 2. Invite your developer friends to compete.',
      requirements: '- Responsive grid showing gameplay specs\n- Animated screenshot carousel\n- Interactive pre-order modal\n- Parallax background scrolling',
      guidelines: 'Use vibrant retro aesthetics but preserve a modern clean SaaS structure. Dark theme with neon accents is acceptable for this prompt.',
      registrationStart: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: 'upcoming'
    }
  });

  // Seed some activity logs
  for (const builder of createdBuilders) {
    await prisma.activityLog.create({
      data: {
        userId: builder.id,
        type: 'register',
        content: `Registered for upcoming battle: "${upcomingBattle.title}"`
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
