const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const BusinessIdea = require('./models/BusinessIdea');
const Roadmap = require('./models/Roadmap');
const Lesson = require('./models/Lesson');
const Message = require('./models/Message');
const UserRoadmapProgress = require('./models/UserRoadmapProgress');

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/entreskill';
    await mongoose.connect(connStr);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await BusinessIdea.deleteMany({});
    await Roadmap.deleteMany({});
    await Lesson.deleteMany({});
    await Message.deleteMany({});
    await UserRoadmapProgress.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Users (passwords will be hashed automatically by UserSchema pre-save hook)
    const users = [
      {
        name: 'Administrator',
        email: 'admin@entreskill.com',
        password: 'password123',
        role: 'admin',
        skills: []
      },
      {
        name: 'Maria Santos (Tailoring Expert)',
        email: 'designer.maria@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Tailoring', 'Textiles'],
        isApprovedMentor: true
      },
      {
        name: 'Chef Raj Patel',
        email: 'chef.raj@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Cooking', 'Food Processing'],
        isApprovedMentor: true
      },
      {
        name: 'Sam Wilson (Freelance Consultant)',
        email: 'marketer.sam@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Digital Content Creation', 'Local Retail'],
        isApprovedMentor: true
      },
      {
        name: 'Alex Johnson (Student User)',
        email: 'student@entreskill.com',
        password: 'password123',
        role: 'user',
        skills: ['Cooking', 'Digital Content Creation']
      }
    ];

    const seededUsers = [];
    for (const u of users) {
      const newUser = new User(u);
      await newUser.save();
      seededUsers.push(newUser);
    }
    console.log(`Seeded ${seededUsers.length} users successfully.`);

    // 2. Track A: Tailoring & Fashion Design Boutique Setup
    const ideaA = new BusinessIdea({
      title: 'Boutique & Tailoring Studio Startup',
      description: 'Establish a custom apparel and alteration boutique serving local clients with bespoke designs.',
      matchingSkills: ['Tailoring', 'Textiles']
    });
    await ideaA.save();

    const roadmapA = new Roadmap({
      businessIdeaId: ideaA._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Market Demand Verification & Customer Profiling',
          description: 'Conduct surveys in the neighborhood, verify fabric preferences, identify target demographics, and study competitor rates.',
          toolsRequired: ['Google Forms', 'Notebook', 'Competitor Auditing Chart'],
          estimatedCost: 0,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Sourcing Professional Machinery & Quality Fabrics',
          description: 'Procure high-performance sewing machines, overlock machines, cutting tables, steam irons, and wholesale textile materials.',
          toolsRequired: ['Single Needle Industrial Machine', '3-Thread Overlock', 'Cutting Board', 'Ironing Board'],
          estimatedCost: 15000,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Local Business Name Registration & Micro-Marketing',
          description: 'Register business name, obtain local permits, design branding logos, print visiting cards, and launch a WhatsApp business channel.',
          toolsRequired: ['Canva', 'WhatsApp Business', 'Local Government Business Portal'],
          estimatedCost: 2000,
          isCompleted: false
        }
      ]
    });
    await roadmapA.save();

    const lessonA = new Lesson({
      businessIdeaId: ideaA._id,
      modules: [
        {
          moduleTitle: 'Demographics and Alterations Guide',
          durationText: '12 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Target Demographics Analysis\nTo build a tailoring business, catalog your neighborhood needs. Look for: \n- **Bespoke tailoring requirements** (festive garments, bridal gowns)\n- **Corporate alterations** (suit tailoring, uniform alterations)\n- **Repair and adjustments** (zipper replacement, hemming).\n\nKeep client cards containing size metrics (shoulders, bust, waist, hips, length) to build long-term repeat services.'
        },
        {
          moduleTitle: 'Equipment Sourcing & Quality Checks',
          durationText: '15 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/jZ_y-l842-I',
          summaryBody: 'This module covers the procurement checklist. Learn about heavy-duty direct-drive sewing motors that save 60% electricity, standard sizing gauges, and how to verify fabric thread count to avoid shrink-leak complaints.'
        }
      ]
    });
    await lessonA.save();

    ideaA.roadmapId = roadmapA._id;
    ideaA.lessonTrackId = lessonA._id;
    await ideaA.save();


    // 3. Track B: Cloud Kitchen & Homemade Food Catering Services
    const ideaB = new BusinessIdea({
      title: 'Cloud Kitchen & Culinary Catering Venture',
      description: 'Launch a home-based digital kitchen offering pre-ordered healthy lunchboxes and weekend party catering.',
      matchingSkills: ['Cooking', 'Food Processing']
    });
    await ideaB.save();

    const roadmapB = new Roadmap({
      businessIdeaId: ideaB._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Menu Finalization & Raw Material Supply Logistics Setup',
          description: 'Create a streamlined 5-item signature menu, locate local wholesale dry grocery suppliers, and draft recipes for portion control.',
          toolsRequired: ['Excel Recipe Cost Sheet', 'Menu Mockup Creator'],
          estimatedCost: 1000,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Commercial Equipment Procurement & Safety Checks',
          description: 'Acquire high-speed blenders, heavy burner stoves, temperature controllers, and food-grade plastic packaging boxes.',
          toolsRequired: ['Double Burner Gas Stove', 'Commercial Mixer Grinder', 'Digital Kitchen Scale'],
          estimatedCost: 12000,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Basic Digital Menu Integration & Neighborhood Delivery Setup',
          description: 'Create a Google Maps profile, partner with local delivery riders, distribute flyers in residential complexes, and set up a digital billing system.',
          toolsRequired: ['Google Business Profile', 'Dukaan App', 'QR Code Payments'],
          estimatedCost: 1500,
          isCompleted: false
        }
      ]
    });
    await roadmapB.save();

    const lessonB = new Lesson({
      businessIdeaId: ideaB._id,
      modules: [
        {
          moduleTitle: 'Recipe Standardization and Packaging Logistics',
          durationText: '18 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Unit Economics and Ingredients\nEvery food plate must be priced at 3x ingredient cost. In homemade catering, layout is key:\n1. **Ingredient Prep**: 30% time allocation.\n2. **Cooking**: 30% time allocation.\n3. **Packaging**: 40% time allocation.\n\nUse leakproof container boxes to maintain aesthetic value and prevent sauces from blending during delivery.'
        },
        {
          moduleTitle: 'Food Safety & Hygiene Protocols',
          durationText: '10 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/5UqCcrp57n0',
          summaryBody: 'A video detailing correct kitchen workflow separations (raw vs cooked), sanitation schedules, and storing temperatures (refrigerator at 4°C, freezer at -18°C) to satisfy local municipal safety checklists.'
        }
      ]
    });
    await lessonB.save();

    ideaB.roadmapId = roadmapB._id;
    ideaB.lessonTrackId = lessonB._id;
    await ideaB.save();


    // 4. Track C: Local Digital Content Creation & Freelancing Agency
    const ideaC = new BusinessIdea({
      title: 'Digital Freelance & Social Marketing Agency',
      description: 'Provide copywriting, graphic design, and social media management for local commercial shops.',
      matchingSkills: ['Digital Content Creation', 'Local Retail']
    });
    await ideaC.save();

    const roadmapC = new Roadmap({
      businessIdeaId: ideaC._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Portfolio Establishment & Skill Validation Checklists',
          description: 'Design mock social layouts, publish sample copywriting posts, set up a GitHub/Behance profile, and publish a services catalog.',
          toolsRequired: ['Behance Portfolio', 'GitHub Pages', 'Google Drive Shared Folder'],
          estimatedCost: 0,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Software Subscriptions & Workstation Preparation',
          description: 'Subscribe to design and copywriting suites, configure professional audio equipment/microphones, and setup workflow boards.',
          toolsRequired: ['Canva Pro Subscription', 'Notion Planner', 'USB Microphone'],
          estimatedCost: 5000,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Client Onboarding Frameworks & Social Platform Promotion',
          description: 'Launch client contract templates, pitch to local restaurants/gyms, and advertise services using LinkedIn and target cold outreach.',
          toolsRequired: ['LinkedIn Sales Navigator', 'Proposify', 'Cold Outreach Email Template'],
          estimatedCost: 500,
          isCompleted: false
        }
      ]
    });
    await roadmapC.save();

    const lessonC = new Lesson({
      businessIdeaId: ideaC._id,
      modules: [
        {
          moduleTitle: 'Building a Visual Services Catalog',
          durationText: '10 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Landing Your First Local Clients\nYour catalog must resolve client pain points. Focus on retail benefits:\n- **Increase walk-ins**: Highlight custom discount flyers.\n- **Improve digital reviews**: Set up automated QR-to-Google-Reviews layouts.\n- **Content Consistency**: Show calendar calendars highlighting holidays (e.g. Diwali, Christmas campaigns).\n\nUse simple pricing tiers: Basic ($100/mo for 4 posts) vs Standard ($250/mo for 10 posts + 1 video Reel).'
        },
        {
          moduleTitle: 'Canva Design & Copywriting Masterclass',
          durationText: '20 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/P1G3MugG9o0',
          summaryBody: 'A walkthrough explaining grids, margins, branding colors, typography setups, and basic AIDA (Attention, Interest, Desire, Action) copywriting formulas for writing local Facebook / Instagram ads.'
        }
      ]
    });
    await lessonC.save();

    ideaC.roadmapId = roadmapC._id;
    ideaC.lessonTrackId = lessonC._id;
    await ideaC.save();

    // 5. Seed some initial messages to populate student/mentor chats
    const studentUser = seededUsers.find(u => u.role === 'user');
    const chefMentor = seededUsers.find(u => u.email === 'chef.raj@entreskill.com');
    const tailoringMentor = seededUsers.find(u => u.email === 'designer.maria@entreskill.com');

    const seedMessages = [
      {
        userId: studentUser._id,
        mentorId: chefMentor._id,
        senderType: 'user',
        contentText: 'Hi Chef Raj! I am planning to start a home-cooked catering service in my neighborhood. Do you have any recommendations for pricing standard thali lunches?'
      },
      {
        userId: studentUser._id,
        mentorId: chefMentor._id,
        senderType: 'mentor',
        contentText: 'Welcome Alex! That is a great project. A gold rule is to keep ingredient cost under 30% of your retail price. Let me know what recipes you are planning!'
      },
      {
        userId: studentUser._id,
        mentorId: tailoringMentor._id,
        senderType: 'user',
        contentText: 'Hello Maria, I am studying tailoring and fashion design. Is it necessary to buy industrial stitching machines right away, or can I start with a home electric model?'
      }
    ];

    await Message.insertMany(seedMessages);
    console.log('Seeded initial private messages between student and mentors.');

    console.log('Seeding process completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
