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

    // Drop database to guarantee all old data is wiped out completely
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully.');

    // 1. Seed Upgraded Users (Mentor profiles match the updated professional categories)
    const users = [
      {
        name: 'System Administrator',
        email: 'admin@entreskill.com',
        password: 'password123',
        role: 'admin',
        skills: []
      },
      {
        name: 'Maria Santos (Fashion Tech Expert)',
        email: 'designer.maria@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Apparel Design & Sustainable Fashion Tech'],
        isApprovedMentor: true
      },
      {
        name: 'Chef Raj Patel (Culinary Arts Director)',
        email: 'chef.raj@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Culinary Arts, Cloud Kitchens & Commercial Catering'],
        isApprovedMentor: true
      },
      {
        name: 'Sam Wilson (Brand Strategist)',
        email: 'marketer.sam@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Digital Branding, Content Strategy & Freelance Agency'],
        isApprovedMentor: true
      },
      {
        name: 'Liam Vance (Artisanal Manufacturing Consultant)',
        email: 'craft.liam@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Handicrafts Artistry, Upcycled Decor & Micro-Manufacturing'],
        isApprovedMentor: true
      },
      {
        name: 'Elena Rostova (Technical Service Specialist)',
        email: 'repair.elena@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Consumer Electronics, Maintenance & Technical Services'],
        isApprovedMentor: true
      },
      {
        name: 'Kabir Mehta (Retail & Supply Chain Manager)',
        email: 'retail.kabir@entreskill.com',
        password: 'password123',
        role: 'mentor',
        skills: ['Micro-Retail Operations & Supply Chain Management'],
        isApprovedMentor: true
      },
      {
        name: 'Alex Johnson (Student Entrepreneur)',
        email: 'student@entreskill.com',
        password: 'password123',
        role: 'user',
        skills: [
          'Culinary Arts, Cloud Kitchens & Commercial Catering',
          'Digital Branding, Content Strategy & Freelance Agency'
        ]
      }
    ];

    const seededUsers = [];
    for (const u of users) {
      const newUser = new User(u);
      await newUser.save();
      seededUsers.push(newUser);
    }
    console.log(`Seeded ${seededUsers.length} users successfully.`);

    // ==========================================
    // PATHWAY 1: Bespoke Apparel & Sustainable Fashion Studio
    // ==========================================
    const idea1 = new BusinessIdea({
      title: 'Bespoke Apparel & Sustainable Fashion Studio',
      description: 'Design and manufacture custom organic clothing collections using zero-waste pattern-making and circular production lines.',
      matchingSkills: ['Apparel Design & Sustainable Fashion Tech']
    });
    await idea1.save();

    const roadmap1 = new Roadmap({
      businessIdeaId: idea1._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Sustainable Textiles Sourcing & Eco-Audit',
          description: 'Identify global organic cotton and linen wholesalers, audit their ecological certifications, and formulate a local low-waste cutting blueprint.',
          toolsRequired: ['Organic GOTS Standard Catalog', 'Zero-Waste Pattern Guide', 'Sourcing Ledger'],
          estimatedCost: 1500,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Digital Apparel Prototyping & Technical Packages',
          description: 'Develop virtual 3D garment fits to prevent fabric sample waste, compile precise technical specification packs, and grade standard size templates.',
          toolsRequired: ['CLO 3D Suite', 'Adobe Illustrator Tech Pack', 'Sizing Grid Charts'],
          estimatedCost: 2500,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Direct-Drive Stitching Station & E-Commerce Launch',
          description: 'Acquire power-saving direct-drive industrial sewing machinery, install studio workstations, and set up a pre-order storefront on Shopify.',
          toolsRequired: ['Direct-Drive Lockstitch Machine', '3-Thread Overlocker', 'Shopify Storefront', 'Google Business Listing'],
          estimatedCost: 5000,
          isCompleted: false
        }
      ]
    });
    await roadmap1.save();

    const lesson1 = new Lesson({
      businessIdeaId: idea1._id,
      modules: [
        {
          moduleTitle: 'Eco-Friendly Fabric Selection & Sourcing',
          durationText: '12 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Understanding Sustainable Textiles\nTo position your brand in the sustainable fashion sector, verify raw input fibers. Look for GOTS (Global Organic Textile Standard) certified suppliers, biodegradable thread fibers, and plant-based dyes. \n\nConducting a regular eco-audit involves calculating material wastage percentages and tracking carbon output across logistics legs to ensure a fully transparent corporate footprint.'
        },
        {
          moduleTitle: 'CLO 3D CAD Fitting & Digital Patterns',
          durationText: '20 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/jZ_y-l842-I',
          summaryBody: 'This video session guides you through importing digital sketches into 3D CAD software, fitting templates onto virtual avatars, drafting 2D pattern sheets, and grading patterns across multiple size categories with zero material usage.'
        }
      ]
    });
    await lesson1.save();

    idea1.roadmapId = roadmap1._id;
    idea1.lessonTrackId = lesson1._id;
    await idea1.save();


    // ==========================================
    // PATHWAY 2: Eco-Friendly Artisanal Crafts & Creative Upcycled Decor Enterprise
    // ==========================================
    const idea2 = new BusinessIdea({
      title: 'Eco-Friendly Artisanal Crafts & Creative Upcycled Decor Enterprise',
      description: 'Manufacture handcraft-driven interior decorations, lighting features, and furniture by repurposing reclaimed domestic scrap elements.',
      matchingSkills: ['Handicrafts Artistry, Upcycled Decor & Micro-Manufacturing']
    });
    await idea2.save();

    const roadmap2 = new Roadmap({
      businessIdeaId: idea2._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Upcycled Raw Material Procurement & Community Networks',
          description: 'Organize municipal scrap pickup drives, secure partnerships with demolition yards, and audit local material safety guidelines.',
          toolsRequired: ['Scrap Hub Directory', 'Material Classification Sheet', 'Safety Regulation Manual'],
          estimatedCost: 800,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Safety Processing & Handcrafted Product Prototyping',
          description: 'Build initial product prototypes, execute safety treatments for old paint/lead elements, and draft standard quality assurance checklists.',
          toolsRequired: ['Electric Sander & Treat Kit', 'Lead testing kit', 'Quality Control Checklist'],
          estimatedCost: 1500,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Brand Identity, Packaging & Craft Market Registries',
          description: 'Deploy online store pages, manage digital payments, secure registry booths at regional craft fairs, and print product catalog cards.',
          toolsRequired: ['Canva Branding Pack', 'Compostable Packaging Materials', 'Exhibition Registration Forms'],
          estimatedCost: 1200,
          isCompleted: false
        }
      ]
    });
    await roadmap2.save();

    const lesson2 = new Lesson({
      businessIdeaId: idea2._id,
      modules: [
        {
          moduleTitle: 'Sourcing Reclaimed Materials & Safety Treatment',
          durationText: '10 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Sourcing Safe Upcycled Materials\nWhen upcycling reclaimed wood, metal, and glass, establish rigorous safety testing pipelines. Lead paint test kits are required for wood sourced from vintage structures built before 1978. \n\nImplement structural treatments using non-toxic sealants to prevent pesticide leaching while maintaining the organic, rustic aesthetic of your products.'
        },
        {
          moduleTitle: 'Product Photography & Exhibition Setup',
          durationText: '15 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/P1G3MugG9o0',
          summaryBody: 'Learn how to capture professional product shots with smartphone cameras using natural side-lighting, and structure modular booths for maximum craft show visual impact.'
        }
      ]
    });
    await lesson2.save();

    idea2.roadmapId = roadmap2._id;
    idea2.lessonTrackId = lesson2._id;
    await idea2.save();


    // ==========================================
    // PATHWAY 3: Smart Kitchen Home-Catering & Gourmet Meal Prep Logistics
    // ==========================================
    const idea3 = new BusinessIdea({
      title: 'Smart Kitchen Home-Catering & Gourmet Meal Prep Logistics',
      description: 'Launch an eco-friendly commercial cloud kitchen offering custom calorie-calculated meal subscription boxes and executive party catering.',
      matchingSkills: ['Culinary Arts, Cloud Kitchens & Commercial Catering']
    });
    await idea3.save();

    const roadmap3 = new Roadmap({
      businessIdeaId: idea3._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Menu Engineering, Portion Audits & Ingredient Sourcing',
          description: 'Draft a streamlined calorie-labeled seasonal menu, secure bulk contracts with localized organic farms, and configure menu costing sheets.',
          toolsRequired: ['Nutritional Calculator', 'Bulk Ingredient Cost Worksheet', 'Farms Partner Directory'],
          estimatedCost: 1000,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'High-Efficiency Commercial Kitchen Equipment & Safety Permits',
          description: 'Procure commercial-grade food processors, double ranges, stainless tables, and pass municipal health department inspections.',
          toolsRequired: ['Commercial Oven Range', 'Stainless Steel Prep Tables', 'Food Handler Certifications', 'Local Health Permit'],
          estimatedCost: 7500,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Digital Ordering Integration & Sub-Zero Delivery Operations',
          description: 'Deploy online catering ordering portals, partner with express neighborhood dispatchers, and package meals in leakproof thermal wraps.',
          toolsRequired: ['Dukaan App / Shopify POS', 'Stripe Billing API', 'Insulated Courier Box Liners'],
          estimatedCost: 2000,
          isCompleted: false
        }
      ]
    });
    await roadmap3.save();

    const lesson3 = new Lesson({
      businessIdeaId: idea3._id,
      modules: [
        {
          moduleTitle: 'Menu Portioning and Kitchen Prep Workflows',
          durationText: '18 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Menu Engineering & Culinary Math\nEvery recipe must target a food cost percentage under 30% of standard retail prices. Organize your cloud kitchen using the Mise En Place methodology:\n1. **Weighing and Prepping**: Group ingredients in food-grade prep bowls.\n2. **Cooking**: Divide operations between cold salad stations and hot ranges.\n3. **Packaging**: Seal entrees instantly using eco-friendly heat trays to lock in freshness.'
        },
        {
          moduleTitle: 'Kitchen Sanitation & HACCP Safety Audits',
          durationText: '12 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/5UqCcrp57n0',
          summaryBody: 'Watch this safety training tutorial detailing cross-contamination prevention, temperature control charts (keeping beef and poultry below 4°C during storage), and establishing sanitizing procedures.'
        }
      ]
    });
    await lesson3.save();

    idea3.roadmapId = roadmap3._id;
    idea3.lessonTrackId = lesson3._id;
    await idea3.save();


    // ==========================================
    // PATHWAY 4: High-Yield Digital Marketing Consulting & Freelance Content Agency
    // ==========================================
    const idea4 = new BusinessIdea({
      title: 'High-Yield Digital Marketing Consulting & Freelance Content Agency',
      description: 'Deliver search engine optimization (SEO), data-driven copywriting, and social media brand management services for small businesses and tech clients.',
      matchingSkills: ['Digital Branding, Content Strategy & Freelance Agency']
    });
    await idea4.save();

    const roadmap4 = new Roadmap({
      businessIdeaId: idea4._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Brand Positioning, Portfolio Site & Skill Accreditations',
          description: 'Design a premium modern agency showcase page, write case studies of mock campaigns, and complete search platform analytics certifications.',
          toolsRequired: ['Webflow Developer Account', 'Google Analytics Certification', 'Behance Portfolio Space'],
          estimatedCost: 500,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Software Integration & Legal Service Level Contracts',
          description: 'Subscribe to high-performance content planning software, configure marketing analysis tools, and draft client service agreements.',
          toolsRequired: ['Adobe Creative Suite License', 'SEMrush Dashboard Account', 'Legal Agency Contract templates'],
          estimatedCost: 2500,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Outreach Automation & Bidding Platform Pipelines',
          description: 'Configure cold outreach software engines, establish optimized bidding profiles on global freelance portals, and launch campaigns.',
          toolsRequired: ['Apollo.io Account', 'Upwork Agency Hub Profile', 'Mailshake Campaign Scheduler'],
          estimatedCost: 800,
          isCompleted: false
        }
      ]
    });
    await roadmap4.save();

    const lesson4 = new Lesson({
      businessIdeaId: idea4._id,
      modules: [
        {
          moduleTitle: 'Drafting High-Yield Freelance Service Contracts',
          durationText: '11 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Building Professional Services Agreements\nYour agency contract must detail the following clauses to protect cash flow:\n- **Deposit Requirement**: Enforce a 50% upfront payment milestone before launching work.\n- **Scope Creep Caps**: Restrict reviews to exactly 2 rounds per asset.\n- **Indemnification**: Specify that clients own output assets once the balance is cleared.'
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
    await lesson4.save();

    idea4.roadmapId = roadmap4._id;
    idea4.lessonTrackId = lesson4._id;
    await idea4.save();


    // ==========================================
    // PATHWAY 5: Smart-Home Appliance Repair, Maintenance & Technical Support Services
    // ==========================================
    const idea5 = new BusinessIdea({
      title: 'Smart-Home Appliance Repair, Maintenance & Technical Support Services',
      description: 'Set up an advanced electronics diagnostic workshop repairing microcontrollers, smart thermostats, tablets, and smart appliances.',
      matchingSkills: ['Consumer Electronics, Maintenance & Technical Services']
    });
    await idea5.save();

    const roadmap5 = new Roadmap({
      businessIdeaId: idea5._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Advanced Diagnostics Hardware & Safety Toolset Sourcing',
          description: 'Procure high-performance oscilloscopes, thermal diagnostic cameras, micro-soldering hot air units, and anti-static ESD equipment.',
          toolsRequired: ['Digital Storage Oscilloscope', 'SMD Hot Air Station', 'ESD Grounding Mats', 'Soldering Safety Gear'],
          estimatedCost: 6000,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'Component Supply Chains & Diagnostic Software Licensing',
          description: 'Establish contracts with original electronic part suppliers, define standard repair service pricing menus, and layout intake forms.',
          toolsRequired: ['ZXW Board-Level Schematic Database', 'Supplier SLA Spreadsheets', 'Customer Repair Intake Forms'],
          estimatedCost: 1500,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Google Maps SEO & Neighborhood Launch Campaign',
          description: 'Deploy business listings on local mapping engines, launch search campaign ads, and print marketing service flyer brochures.',
          toolsRequired: ['Google Maps Listing', 'Google Local Ads Console', 'Technical Service Pamphlets'],
          estimatedCost: 1000,
          isCompleted: false
        }
      ]
    });
    await roadmap5.save();

    const lesson5 = new Lesson({
      businessIdeaId: idea5._id,
      modules: [
        {
          moduleTitle: 'ESD Safety & Diagnostic Bench Setup',
          durationText: '14 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Building an ESD-Safe Workspace\nElectrostatic discharge (ESD) can destroy delicate microchips without warning. Keep your repair bench grounded using an ESD wrist strap and dissipative rubber table mat.\n\nUse a thermal imaging camera when diagnostic testing boards to look for instant heat spots signaling a direct short-to-ground on power lines.'
        },
        {
          moduleTitle: 'Precision Micro-Soldering Techniques',
          durationText: '20 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/jZ_y-l842-I',
          summaryBody: 'This instruction video covers flux application, nozzle temperature guides (350°C to 380°C for lead-free solder profiles), and connector replacement procedures.'
        }
      ]
    });
    await lesson5.save();

    idea5.roadmapId = roadmap5._id;
    idea5.lessonTrackId = lesson5._id;
    await idea5.save();


    // ==========================================
    // PATHWAY 6: Hyper-Local Specialty Micro-Retail & Inventory Management Shop
    // ==========================================
    const idea6 = new BusinessIdea({
      title: 'Hyper-Local Specialty Micro-Retail & Inventory Management Shop',
      description: 'Open a local specialty retail experience utilizing real-time inventory management networks and localized wholesale supply chains.',
      matchingSkills: ['Micro-Retail Operations & Supply Chain Management']
    });
    await idea6.save();

    const roadmap6 = new Roadmap({
      businessIdeaId: idea6._id,
      steps: [
        {
          stepNumber: 1,
          title: 'Neighborhood Demand Research & Retail Location Survey',
          description: 'Analyze local retail voids, study community spending patterns, and secure a leasehold storefront with heavy foot traffic.',
          toolsRequired: ['Community Survey Analysis Tool', 'Retail Void Checklist', 'Store Lease Templates'],
          estimatedCost: 1200,
          isCompleted: false
        },
        {
          stepNumber: 2,
          title: 'POS Billing Infrastructure & Inventory Control Systems',
          description: 'Configure real-time barcode management programs, install automated retail cash-drawers, and set up supplier intake shelving.',
          toolsRequired: ['Katana MRP Inventory Suite', 'Shopify POS Terminal', 'Barcode Label Printers'],
          estimatedCost: 4000,
          isCompleted: false
        },
        {
          stepNumber: 3,
          title: 'Visual Merchandising & Grand Opening Campaigns',
          description: 'Build window store displays, install high-quality outdoor light boxes, and distribute discount flyers to nearby neighborhoods.',
          toolsRequired: ['Window Display Shelves', 'Store Front Light Box', 'Grand Opening Coupons'],
          estimatedCost: 2800,
          isCompleted: false
        }
      ]
    });
    await roadmap6.save();

    const lesson6 = new Lesson({
      businessIdeaId: idea6._id,
      modules: [
        {
          moduleTitle: 'Modern Inventory & POS Systems Setup',
          durationText: '15 mins',
          contentType: 'article_markdown',
          resourceUrl: '',
          summaryBody: '### Optimizing Micro-Retail Inventory\nTrack inventory turns to avoid locking capital in slow-moving items. Your Point of Sale (POS) system should trigger automatic alerts when SKU levels fall below the reorder point.\n\nOrganize products on retail shelves following modern visual merchandising rules: place high-margin impulse items at eye level (approx. 5 feet) to maximize basket sizes.'
        },
        {
          moduleTitle: 'Store Branding & Visual Layout Strategy',
          durationText: '15 mins',
          contentType: 'video_embed',
          resourceUrl: 'https://www.youtube.com/embed/P1G3MugG9o0',
          summaryBody: 'A video detailing correct storefront branding, lighting setups, window display strategies, and grand opening promotions to draw initial traffic.'
        }
      ]
    });
    await lesson6.save();

    idea6.roadmapId = roadmap6._id;
    idea6.lessonTrackId = lesson6._id;
    await idea6.save();


    // ==========================================
    // Seed some initial messages to populate student/mentor chats
    // ==========================================
    const studentUser = seededUsers.find(u => u.role === 'user');
    const chefMentor = seededUsers.find(u => u.email === 'chef.raj@entreskill.com');
    const fashionMentor = seededUsers.find(u => u.email === 'designer.maria@entreskill.com');

    const seedMessages = [
      {
        userId: studentUser._id,
        mentorId: chefMentor._id,
        senderType: 'user',
        contentText: 'Hi Chef Raj! I am planning to start a cloud kitchen subscription service in our area. Do you have any suggestions for standard pricing menus?'
      },
      {
        userId: studentUser._id,
        mentorId: chefMentor._id,
        senderType: 'mentor',
        contentText: 'Welcome Alex! Starting with subscriptions is smart. Ensure your food costing stays under 30% of retail price. Let me know what recipes you are planning!'
      },
      {
        userId: studentUser._id,
        mentorId: fashionMentor._id,
        senderType: 'user',
        contentText: 'Hello Maria, I am building my fashion portfolio. Do you suggest purchasing industrial heavy duty sewing tables first, or is a domestic machine enough for early prototyping?'
      }
    ];

    await Message.insertMany(seedMessages);
    console.log('Seeded initial private messages between student and mentors.');

    console.log('Seeding process completed successfully with 6 distinct pathways!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
